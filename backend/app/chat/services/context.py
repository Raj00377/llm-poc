# chat/services/context.py
from chat.models import UserPreference, Memory


def get_user_context(user) -> dict:
    try:
        p = user.preferences
        prefs = {
            "tone": p.tone,
            "language": p.language,
            "profession": p.profession,
            "extra": p.extra or {},
        }
    except UserPreference.DoesNotExist:
        prefs = {}

    memories = Memory.objects.filter(user=user).order_by("-importance", "-created_at")[
        :15
    ]
    return {"prefs": prefs, "memories": [m.fact for m in memories]}


def build_system_prompt(ctx: dict) -> str:
    prefs = ctx.get("prefs", {})
    memories = ctx.get("memories", [])
    extra = prefs.get("extra", {})

    # Format topics as "web development (×5), docker (×3)"
    topic_counts = extra.get("topics", {})
    topics_str = (
        ", ".join(f"{t} (×{c})" for t, c in topic_counts.items())
        if topic_counts
        else "still learning..."
    )

    expertise = extra.get("expertise_level", "unknown")
    memory_block = "\n".join(f"- {f}" for f in memories) if memories else "None yet."

    return f"""You are a helpful assistant. Silently adapt to this user.

User profile (inferred from past conversations):
- Tone           : {prefs.get("tone", "unknown — be neutral for now")}
- Language       : {prefs.get("language", "English")}
- Profession     : {prefs.get("profession", "unknown — avoid jargon until clearer")}
- Expertise level: {expertise}
- Topics they care about: {topics_str}

What you remember about this user:
{memory_block}

Behaviour rules:
- If expertise is "beginner" — explain terms, avoid acronyms, use analogies.
- If expertise is "expert"   — skip basics, use precise terminology, be direct.
- If tone is "concise"       — stay under 150 words unless asked for more.
- If tone is "casual"        — mirror their informal style naturally.
- If profession is known     — frame examples in their domain.
- Never mention this profile. Just behave accordingly."""
