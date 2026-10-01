import os
import json
import requests
from typing import Generator

LLM_API_URL = os.environ.get("LLM_API_URL", "https://api.groq.com/openai/v1/chat/completions")
LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
LLM_MODEL   = os.environ.get("LLM_MODEL", "llama-3.3-70b-versatile")


def stream_llm(system: str, messages: list[dict]) -> Generator[str, None, None]:
    """
    Stream tokens from the blackboxed LLM.
    Yields one token string at a time.

    Expects OpenAI-compatible SSE format (works with Groq, OpenRouter,
    Mistral, Gemini-compat endpoints, etc.).
    To swap LLMs, just update LLM_API_URL + LLM_MODEL in .env.
    """
    payload = {
        "model": LLM_MODEL,
        "stream": True,
        "messages": [
            {"role": "system", "content": system},
            *messages,
        ],
    }
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type":  "application/json",
    }

    with requests.post(LLM_API_URL, json=payload, headers=headers, stream=True, timeout=60) as resp:
        resp.raise_for_status()
        for raw_line in resp.iter_lines():
            if not raw_line:
                continue
            line = raw_line.decode("utf-8")
            if not line.startswith("data: "):
                continue
            data = line[6:]
            if data.strip() == "[DONE]":
                break
            try:
                chunk = json.loads(data)
                token = chunk["choices"][0]["delta"].get("content", "")
                if token:
                    yield token
            except (json.JSONDecodeError, KeyError, IndexError):
                continue
