import { useState, useEffect, useRef } from "react"
import { useChat } from "../hooks/useChat"

export function ChatWindow({ convId }) {
  const { messages, send, streaming, error, loadMessages } = useChat(convId)
  const [input,    setInput]    = useState("")
  const bottomRef               = useRef(null)

  // Load history when conversation changes
  useEffect(() => {
    if (convId) loadMessages(convId)
  }, [convId])

  // Auto-scroll to bottom on new tokens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput("")
    send(text)
  }

  return (
    <div style={styles.container}>
      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            Start a conversation — or type <code>/remember</code> to save a fact about yourself.
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ ...styles.bubble, ...(m.role === "user" ? styles.userBubble : styles.aiBubble) }}>
            <span style={styles.roleLabel}>{m.role === "user" ? "You" : "AI"}</span>
            <p style={styles.content}>{m.content}</p>
            {/* Blinking cursor while streaming on last assistant message */}
            {streaming && i === messages.length - 1 && m.role === "assistant" && (
              <span style={styles.cursor}>▌</span>
            )}
          </div>
        ))}

        {error && <div style={styles.error}>⚠️ {error}</div>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <textarea
          style={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Message… (Shift+Enter for new line, /remember <fact> to save a memory)"
          disabled={streaming}
          rows={1}
        />
        <button style={styles.button} onClick={handleSend} disabled={streaming}>
          {streaming ? "…" : "Send"}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display:       "flex",
    flexDirection: "column",
    height:        "100%",
    background:    "#1e1e2e",
  },
  messages: {
    flex:      1,
    overflowY: "auto",
    padding:   "24px 16px",
    display:   "flex",
    flexDirection: "column",
    gap:       "16px",
  },
  empty: {
    color:     "#888",
    textAlign: "center",
    marginTop: "40px",
    fontSize:  "14px",
  },
  bubble: {
    maxWidth:     "75%",
    padding:      "12px 16px",
    borderRadius: "12px",
    lineHeight:   1.6,
  },
  userBubble: {
    alignSelf:   "flex-end",
    background:  "#4f46e5",
    color:       "#fff",
  },
  aiBubble: {
    alignSelf:   "flex-start",
    background:  "#2a2a3e",
    color:       "#e0e0e0",
  },
  roleLabel: {
    fontSize:    "11px",
    opacity:     0.6,
    marginBottom: "4px",
    display:     "block",
  },
  content: {
    margin:      0,
    whiteSpace:  "pre-wrap",
    wordBreak:   "break-word",
  },
  cursor: {
    animation: "blink 1s step-end infinite",
    color:     "#a0a0ff",
  },
  error: {
    color:        "#f87171",
    background:   "#2d1515",
    padding:      "10px 14px",
    borderRadius: "8px",
    fontSize:     "13px",
  },
  inputRow: {
    display:    "flex",
    gap:        "10px",
    padding:    "16px",
    borderTop:  "1px solid #333",
    background: "#16161e",
  },
  textarea: {
    flex:         1,
    resize:       "none",
    padding:      "12px",
    borderRadius: "8px",
    border:       "1px solid #444",
    background:   "#2a2a3e",
    color:        "#e0e0e0",
    fontSize:     "14px",
    outline:      "none",
  },
  button: {
    padding:      "12px 20px",
    borderRadius: "8px",
    border:       "none",
    background:   "#4f46e5",
    color:        "#fff",
    cursor:       "pointer",
    fontWeight:   600,
    fontSize:     "14px",
  },
}
