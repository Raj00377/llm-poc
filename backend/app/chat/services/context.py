from chat.models import UserPreference, Memory


def get_user_context(user) -> dict:
    """Load preferences and top memories for a user."""

    try:
        p = user.preferences
        prefs = {
            "tone":       p.tone,
            "language":   p.language,
            "profession": p.profession,
            "extra":      p.extra,
        }
    except UserPreference.DoesNotExist:
        prefs = {}

    memories = Memory.objects.filter(user=user) \
                             .order_by("-importance", "-created_at")[:15]
    facts = [m.fact for m in memories]

    return {"prefs": prefs, "memories": facts}


def build_system_prompt(ctx: dict) -> str:
    prefs    = ctx.get("prefs", {})
    memories = ctx.get("memories", [])

    memory_block = (
        "\n".join(f"- {f}" for f in memories)
        if memories else "None yet."
    )

    return f"""You are a helpful assistant.

User profile:
- Tone preference : {prefs.get("tone", "balanced")}
- Language        : {prefs.get("language", "English")}
- Profession      : {prefs.get("profession", "not specified")}

What you remember about this user from past conversations:
{memory_block}

Always adapt your tone and depth to match the user profile above.
Never reveal that you are reading a profile — just behave accordingly."""
