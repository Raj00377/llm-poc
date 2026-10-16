# chat/services/analyser.py
import json
import threading
from chat.models import UserPreference, Memory
from chat.services.llm import stream_llm


def analyse_and_update(user, user_msg: str, assistant_msg: str, conversation):
    """Single background call — LLM infers everything about the user."""
    thread = threading.Thread(
        target=_analyse, args=(user, user_msg, assistant_msg, conversation), daemon=True
    )
    thread.start()


def _analyse(user, user_msg, assistant_msg, conversation):
    prompt = f"""You are a user profiling system. Analyse this conversation exchange 
and extract everything you can infer about the user.

Exchange:
User     : {user_msg}
Assistant: {assistant_msg}

Return ONLY a JSON object in this exact shape (omit any field you cannot infer):
{{
  "tone": "concise|detailed|casual|formal|null",
  "language": "English|Tamil|...|null",
  "profession": "what they likely do for work|null",
  "expertise_level": "beginner|intermediate|expert|null",
  "topics": ["topic1", "topic2"],
  "facts": [
    {{"fact": "...", "importance": 1-10}}
  ]
}}

Rules:
- Infer tone from HOW they write (length, vocabulary, punctuation, slang).
- Infer profession from domain terms, problems they describe, tools they mention.
- Infer expertise from how they frame questions (vague = beginner, precise = expert).
- Topics are broad domains (e.g. "web development", "machine learning", "cooking").
- Facts are stable things about the user worth remembering across conversations.
- If you cannot confidently infer something, omit it — do not guess randomly.
- Return JSON only. No markdown. No explanation."""

    full = ""
    try:
        for token in stream_llm(
            system="You are a user profiling assistant. Output JSON only.",
            messages=[{"role": "user", "content": prompt}],
        ):
            full += token

        data = json.loads(full.strip())
        _apply(user, data, conversation)

    except Exception:
        pass  # never crash the main thread


def _apply(user, data: dict, conversation):
    """Write inferred profile back to DB — only update fields we got."""

    pref, _ = UserPreference.objects.get_or_create(user=user)
    changed = False

    # ── Scalar fields — only overwrite if we got a real value ──
    for field in ("tone", "language", "profession"):
        val = data.get(field)
        if val and val != "null":
            setattr(pref, field, val)
            changed = True

    # ── Extra JSONB — merge, don't replace ─────────────────────
    extra = pref.extra or {}

    expertise = data.get("expertise_level")
    if expertise and expertise != "null":
        extra["expertise_level"] = expertise
        changed = True

    # Accumulate topics with frequency count
    topics = data.get("topics", [])
    topic_counts = extra.get("topics", {})
    for t in topics:
        topic_counts[t] = topic_counts.get(t, 0) + 1
    # Keep top 10 by frequency
    extra["topics"] = dict(
        sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    )
    if topics:
        changed = True

    if changed:
        pref.extra = extra
        pref.save()

    # ── Facts → memories table ──────────────────────────────────
    for item in data.get("facts", []):
        fact = item.get("fact", "").strip()
        importance = item.get("importance", 5)
        if fact:
            Memory.objects.get_or_create(
                user=user,
                fact=fact,
                defaults={
                    "importance": importance,
                    "source_conv": conversation,
                },
            )
