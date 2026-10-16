import { useState, useCallback } from "react"

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1]
}

export function useChat(convId) {
  const [messages,  setMessages]  = useState([])
  const [streaming, setStreaming] = useState(false)
  const [error,     setError]     = useState(null)
  const [loading , setLoading] = useState(false);

  // Load existing messages for a conversation
  const loadMessages = useCallback(async (id) => {
    setLoading(true);
    const res  = await fetch(`/api/conversations/${id}/`)
    const data = await res.json()
    setMessages(
      data.messages.map((m) => ({ id:m.id, role: m.role, content: [{type: "text", text:m.content}] }))
    )
    setLoading(false);
  }, [])

  const send = useCallback(
    async (text) => {
      if (!text.trim() || streaming) return
      setError(null)

      // Optimistically add user bubble
      setMessages((prev) => [...prev, { role: "user", content: text }])
      // Add empty assistant bubble for streaming into
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])
      setStreaming(true)

      try {
        const res = await fetch(`/api/chat/${convId}/`, {
          method:  "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken":  getCookie("csrftoken"),
          },
          credentials: "include",
          body: JSON.stringify({ message: text }),
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const reader  = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6).trim()
            if (data === "[DONE]") break

            const parsed = JSON.parse(data)

            if (parsed.error) {
              setError(parsed.error)
              break
            }

            if (parsed.token) {
              // Append token to last (assistant) message
              setMessages((prev) => {
                const updated = [...prev]
                const last    = updated[updated.length - 1]
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + parsed.token,
                }
                return updated
              })
            }
          }
        }
      } catch (err) {
        setError(err.message)
        // Remove the empty assistant bubble on error
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setStreaming(false)
      }
    },
    [convId, streaming]
  )

  return { messages, send, streaming, error, loadMessages, loading }
}
