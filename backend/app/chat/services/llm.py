import os
import json
import requests
from typing import Generator

LLM_API_URL = os.environ.get(
    "LLM_API_URL", "https://api.groq.com/openai/v1/chat/completions"
)
LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "llama-3.3-70b-versatile")


def extract_token(chunk: dict) -> str:
    """
    Extract a generated token from supported LLM response formats.

    Supports:
    - OpenAI-compatible APIs: Groq, OpenRouter, etc.
    - Ollama native /api/chat API.
    """

    # OpenAI-compatible streaming format
    if "choices" in chunk:
        choices = chunk.get("choices") or []

        if not choices:
            return ""

        delta = choices[0].get("delta") or {}
        return delta.get("content") or ""

    # Ollama native /api/chat streaming format
    if "message" in chunk:
        message = chunk.get("message") or {}
        return message.get("content") or ""

    return ""


def stream_llm(
    system: str,
    messages: list[dict],
) -> Generator[str, None, None]:
    """
    Stream generated text from an OpenAI-compatible or Ollama native API.
    Yields one text fragment at a time.
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
        "Content-Type": "application/json",
    }

    # Add authentication only when the provider requires it.
    if LLM_API_KEY:
        headers["Authorization"] = f"Bearer {LLM_API_KEY}"

    with requests.post(
        LLM_API_URL,
        json=payload,
        headers=headers,
        stream=True,
        timeout=(5, 180),
    ) as resp:
        resp.raise_for_status()

        for raw_line in resp.iter_lines():
            print(f"Raw line from LLM: {raw_line}")  # Debugging
            if not raw_line:
                continue

            line = raw_line.decode("utf-8").strip()

            # OpenAI-compatible SSE: data: {...}
            if line.startswith("data:"):
                data = line[len("data:") :].strip()

                if data == "[DONE]":
                    break

            # Ollama native API: {...} as NDJSON
            else:
                data = line

            try:
                chunk = json.loads(data)
            except json.JSONDecodeError:
                continue

            token = extract_token(chunk)

            if token:
                yield token

            # Ollama native API signals completion with done=true.
            if chunk.get("done") is True:
                break
