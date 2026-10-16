import json
from django.http import StreamingHttpResponse, JsonResponse
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .models import Conversation, Message, UserPreference, Memory
from .services.llm import stream_llm
from .services.context import get_user_context, build_system_prompt
from .services.memory import extract_and_save
from .services.analyser import analyse_and_update

# ── Helpers ────────────────────────────────────────────────────────────────


def json_error(msg, status=400):
    return JsonResponse({"error": msg}, status=status)


# ── Conversations ──────────────────────────────────────────────────────────


@method_decorator(csrf_exempt, name="dispatch")
class ConversationListView(LoginRequiredMixin, View):
    """GET  /api/conversations/       → list all conversations
    POST /api/conversations/       → create a new conversation"""

    def get(self, request):
        convs = Conversation.objects.filter(user=request.user).values(
            "id", "title", "updated_at"
        )
        return JsonResponse({"conversations": list(convs)})

    def post(self, request):
        conv = Conversation.objects.create(user=request.user, title="New Chat")
        return JsonResponse({"id": str(conv.id), "title": conv.title}, status=201)


@method_decorator(csrf_exempt, name="dispatch")
class ConversationDetailView(LoginRequiredMixin, View):
    """GET    /api/conversations/<id>/  → messages in conversation
    PATCH  /api/conversations/<id>/  → rename
    DELETE /api/conversations/<id>/  → delete"""

    def _get_conv(self, request, conv_id):
        try:
            return Conversation.objects.get(id=conv_id, user=request.user)
        except Conversation.DoesNotExist:
            return None

    def get(self, request, conv_id):
        conv = self._get_conv(request, conv_id)
        if not conv:
            return json_error("Not found", 404)
        msgs = list(conv.messages.values("id", "role", "content", "created_at"))
        return JsonResponse({"id": str(conv.id), "title": conv.title, "messages": msgs})

    def patch(self, request, conv_id):
        conv = self._get_conv(request, conv_id)
        if not conv:
            return json_error("Not found", 404)
        body = json.loads(request.body)
        conv.title = body.get("title", conv.title)
        conv.save()
        return JsonResponse({"id": str(conv.id), "title": conv.title})

    def delete(self, request, conv_id):
        conv = self._get_conv(request, conv_id)
        if not conv:
            return json_error("Not found", 404)
        conv.delete()
        return JsonResponse({"status": "deleted"})


# ── Chat (streaming) ───────────────────────────────────────────────────────


@method_decorator(csrf_exempt, name="dispatch")
class ChatView(LoginRequiredMixin, View):
    """POST /api/chat/<conversation_id>/
    Body: { "message": "..." }
    Response: text/event-stream  →  data: {"token": "..."}  …  data: [DONE]
    """

    def post(self, request, conv_id):
        body = json.loads(request.body)
        user_msg = body.get("message", "").strip()
        user = request.user

        if not user_msg:
            return json_error("message is required")

        # Get or create conversation
        conv, _ = Conversation.objects.get_or_create(
            id=conv_id, defaults={"user": user, "title": user_msg[:60]}
        )
        if conv.user != user:
            return json_error("Forbidden", 403)

        # ── /remember shortcut ───────────────────────────────────────────
        if user_msg.lower().startswith("/remember "):
            fact = user_msg[10:].strip()
            Memory.objects.create(user=user, fact=fact, importance=9, source_conv=conv)

            def ack():
                yield f"data: {json.dumps({'token': 'Got it — I will remember that.'})}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingHttpResponse(ack(), content_type="text/event-stream")

        # ── Save user message ────────────────────────────────────────────
        Message.objects.create(conversation=conv, role="user", content=user_msg)

        # Auto-title from first message
        if conv.title == "New Chat":
            conv.title = user_msg[:60]
            conv.save()

        # ── Build context ────────────────────────────────────────────────
        # Last 40 messages to stay within context window
        history = list(
            conv.messages.order_by("created_at").values("role", "content")[:40]
        )
        ctx = get_user_context(user)
        system = build_system_prompt(ctx)

        # ── Stream ───────────────────────────────────────────────────────
        def stream():
            full_response = ""
            try:
                for token in stream_llm(system=system, messages=history):
                    full_response += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                if full_response:
                    Message.objects.create(
                        conversation=conv,
                        role="assistant",
                        content=full_response,
                    )
                    conv.save()  # bump updated_at so it sorts to top
                    extract_and_save(user, user_msg, full_response, conv)

                yield "data: [DONE]\n\n"

        response = StreamingHttpResponse(stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"  # disable Nginx buffering
        return response


# ── Preferences ────────────────────────────────────────────────────────────


@method_decorator(csrf_exempt, name="dispatch")
class PreferencesView(LoginRequiredMixin, View):
    """GET /api/preferences/   → current preferences
    PUT /api/preferences/   → save preferences"""

    def get(self, request):
        try:
            p = request.user.preferences
            data = {
                "tone": p.tone,
                "language": p.language,
                "profession": p.profession,
                "extra": p.extra,
            }
        except UserPreference.DoesNotExist:
            data = {
                "tone": "balanced",
                "language": "English",
                "profession": "",
                "extra": {},
            }
        return JsonResponse(data)

    def put(self, request):
        body = json.loads(request.body)
        UserPreference.objects.update_or_create(
            user=request.user,
            defaults={
                "tone": body.get("tone", "balanced"),
                "language": body.get("language", "English"),
                "profession": body.get("profession", ""),
                "extra": body.get("extra", {}),
            },
        )
        return JsonResponse({"status": "saved"})


# ── Memories ───────────────────────────────────────────────────────────────


@method_decorator(csrf_exempt, name="dispatch")
class MemoriesView(LoginRequiredMixin, View):
    """GET    /api/memories/           → list memories
    DELETE /api/memories/<id>/      → delete one memory"""

    def get(self, request):
        memories = Memory.objects.filter(user=request.user)[:50]
        data = [
            {"id": str(m.id), "fact": m.fact, "importance": m.importance}
            for m in memories
        ]
        return JsonResponse({"memories": data})

    def delete(self, request, memory_id=None):
        if not memory_id:
            return json_error("memory_id required", 400)
        Memory.objects.filter(id=memory_id, user=request.user).delete()
        return JsonResponse({"status": "deleted"})


# ── Auth (simple session-based) ────────────────────────────────────────────


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):
    """POST /api/auth/login/   { "username": "...", "password": "..." }"""

    def post(self, request):
        from django.contrib.auth import authenticate, login

        body = json.loads(request.body)
        username = body.get("username", "")
        password = body.get("password", "")
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return JsonResponse({"status": "ok", "username": user.username})
        return json_error("Invalid credentials", 401)


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(LoginRequiredMixin, View):
    """POST /api/auth/logout/"""

    def post(self, request):
        from django.contrib.auth import logout

        logout(request)
        return JsonResponse({"status": "logged out"})


@method_decorator(csrf_exempt, name="dispatch")
class RegisterView(View):
    """POST /api/auth/register/  { "username": "...", "password": "..." }"""

    def post(self, request):
        from django.contrib.auth import authenticate, login
        from django.contrib.auth.models import User

        body = json.loads(request.body)
        username = body.get("username", "").strip()
        password = body.get("password", "").strip()

        if not username or not password:
            return json_error("username and password required")
        if User.objects.filter(username=username).exists():
            return json_error("Username already taken")

        user = User.objects.create_user(username=username, password=password)
        login(request, user)
        return JsonResponse(
            {"status": "created", "username": user.username}, status=201
        )


@method_decorator(csrf_exempt, name="dispatch")
class MeView(LoginRequiredMixin, View):
    """GET /api/auth/me/  → current user info"""

    def get(self, request):
        return JsonResponse({"username": request.user.username, "id": request.user.id})


@method_decorator(csrf_exempt, name="dispatch")
class FeedbackView(LoginRequiredMixin, View):
    """POST /api/feedback/
    { "message_id": "...", "signal": "regenerate"|"negative"|"positive" }
    """

    def post(self, request):
        body = json.loads(request.body)
        signal = body.get("signal")
        user = request.user

        if signal in ("negative", "regenerate"):
            # Find the message to understand what was disliked
            try:
                msg = Message.objects.get(
                    id=body["message_id"], conversation__user=user
                )
                Memory.objects.create(
                    user=user,
                    fact=f"User was unsatisfied with a '{msg.role}' response — avoid similar style",
                    importance=7,
                    source_conv=msg.conversation,
                )
            except Message.DoesNotExist:
                pass

        elif signal == "positive":
            # Positive signals boost tone confidence — nothing to store yet
            pass

        return JsonResponse({"status": "ok"})
