import json
import threading
from chat.models import Memory
from chat.services.llm import stream_llm


def extract_and_save(user, user_msg: str, assistant_msg: str, conversation):
    """Fire-and-forget — runs in a background thread after every reply."""
    thread = threading.Thread(
        target=_extract,
        args=(user, user_msg, assistant_msg, conversation),
        daemon=True,
    )
    thread.start()


def _extract(user, user_msg, assistant_msg, conversation):
    prompt = f"""Read the exchange below and extract durable facts about the USER ONLY.

Rules:
- Only facts that are stable across conversations (preferences, skills, goals, constraints).
- Skip anything about the topic being discussed.
- Return a JSON array — empty [] if nothing notable.
- JSON only, no markdown fences.

User said  : {user_msg}
Assistant  : {assistant_msg}

Output format:
[{{"fact": "...", "importance": <1-10>}}]"""

    full = ""
    try:
        for token in stream_llm(
            system="You extract user facts from conversations. Output JSON only.",
            messages=[{"role": "user", "content": prompt}],
        ):
            full += token

        facts = json.loads(full)
        for item in facts:
            Memory.objects.create(
                user=user,
                fact=item["fact"],
                importance=item.get("importance", 5),
                source_conv=conversation,
            )
    except Exception:
        pass    # never crash the main thread



# chat/services/memory.py  (updated prompt)

# def _extract(user, user_msg, assistant_msg, conversation):
#     prompt = f"""Extract durable facts about the USER from this exchange.

# Look specifically for:
# - Skills or tools they know ("I use Docker", "I know Python")
# - Goals or projects ("I'm building a SaaS", "I want to learn ML")  
# - Constraints ("I have 2 hours", "I'm a beginner")
# - Opinions ("I prefer X over Y", "I don't like Z")
# - Background ("I work at a startup", "I'm a student")

# Return JSON array only. Empty [] if nothing notable.
# [{{"fact": "...", "importance": 1-10, "category": "skill|goal|constraint|opinion|background"}}]

# User said  : {user_msg}
# Assistant  : {assistant_msg}"""

#     full = ""
#     try:
#         for token in stream_llm(
#             system="Extract user facts. Output JSON only. No markdown.",
#             messages=[{"role": "user", "content": prompt}]
#         ):
#             full += token

#         import json
#         facts = json.loads(full)
#         for item in facts:
#             Memory.objects.get_or_create(   # avoid duplicate facts
#                 user=user,
#                 fact=item["fact"],
#                 defaults={
#                     "importance":  item.get("importance", 5),
#                     "source_conv": conversation,
#                 }
#             )
#     except Exception:
#         pass