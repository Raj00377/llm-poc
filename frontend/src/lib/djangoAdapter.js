function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1]
}

export function createDjangoAdapter(convId) {
  return {
    async *run({ messages, abortSignal }) {
      const lastMessage = messages.at(-1)
      const userText = lastMessage?.content
        ?.filter((c) => c.type === "text")
        ?.map((c) => c.text)
        ?.join("") ?? ""

      const response = await fetch(`/api/chat/${convId}/`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken":  getCookie("csrftoken"),
        },
        credentials: "include",
        signal:       abortSignal,
        body:         JSON.stringify({ message: userText }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText  = ""
      let buffer    = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6).trim()
          if (data === "[DONE]") return

          try {
            const parsed = JSON.parse(data)
            if (parsed.token) {
              fullText += parsed.token
              yield { content: [{ type: "text", text: fullText }] }
            }
          } catch { /* skip */ }
        }
      }
    }
  }
}