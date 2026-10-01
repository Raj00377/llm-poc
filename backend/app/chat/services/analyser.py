# chat/services/analyser.py
import threading
from chat.models import UserPreference

def analyse_and_update(user, user_msg: str):
    thread = threading.Thread(target=_analyse, args=(user, user_msg), daemon=True)
    thread.start()

def _analyse(user, user_msg: str):
    words      = user_msg.split()
    word_count = len(words)
    msg_lower  = user_msg.lower()

    updates = {}

    # ── Tone from message length ─────────────────────────
    if word_count <= 6:
        updates["tone"] = "concise"
    elif word_count >= 40:
        updates["tone"] = "detailed"

    # ── Casual signals ───────────────────────────────────
    casual_words = {"lol", "tbh", "ngl", "btw", "omg", "idk", "ty", "thx", "plz"}
    if casual_words & set(words):
        updates["tone"] = "casual"

    # ── Profession hints ────────────────────────────────
    profession_map = {
        "code":      ["code", "function", "bug", "api", "deploy", "git", "error", "debug"],
        "designer":  ["ui", "ux", "figma", "design", "color", "layout", "typography"],
        "marketer":  ["campaign", "seo", "funnel", "conversion", "ctr", "audience"],
        "student":   ["exam", "assignment", "lecture", "study", "university", "thesis"],
        "writer":    ["draft", "article", "paragraph", "publish", "blog", "essay"],
    }
    for profession, keywords in profession_map.items():
        if any(kw in msg_lower for kw in keywords):
            updates["profession"] = profession
            break

    if updates:
        UserPreference.objects.update_or_create(
            user=user, defaults=updates
        )