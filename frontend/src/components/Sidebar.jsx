import { useState, useEffect } from "react"

function getCookie(name) {
  return document.cookie.split("; ").find((r) => r.startsWith(name + "="))?.split("=")[1]
}

export function Sidebar({ activeConvId, onSelect, onNew, onLogout }) {
  const [conversations, setConversations] = useState([])

  const load = async () => {
    const res  = await fetch("/api/conversations/", { credentials: "include" })
    const data = await res.json()
    setConversations(data.conversations || [])
  }

  useEffect(() => { load() }, [activeConvId])

  const newChat = async () => {
    const res  = await fetch("/api/conversations/", {
      method:      "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    })
    const data = await res.json()
    onNew(data.id)
    load()
  }

  const deleteConv = async (e, id) => {
    e.stopPropagation()
    await fetch(`/api/conversations/${id}/`, {
      method:      "DELETE",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    })
    if (id === activeConvId) onNew(null)
    load()
  }

  return (
    <aside style={styles.sidebar}>
      <button style={styles.newBtn} onClick={newChat}>+ New Chat</button>

      <div style={styles.list}>
        {conversations.map((c) => (
          <div
            key={c.id}
            style={{
              ...styles.item,
              ...(c.id === activeConvId ? styles.activeItem : {}),
            }}
            onClick={() => onSelect(c.id)}
          >
            <span style={styles.itemTitle}>{c.title || "Untitled"}</span>
            <button style={styles.deleteBtn} onClick={(e) => deleteConv(e, c.id)}>✕</button>
          </div>
        ))}
      </div>

      <button style={styles.logoutBtn} onClick={onLogout}>Sign out</button>
    </aside>
  )
}

const styles = {
  sidebar: {
    width:          "260px",
    minWidth:       "260px",
    background:     "#16161e",
    borderRight:    "1px solid #333",
    display:        "flex",
    flexDirection:  "column",
    padding:        "12px 8px",
    gap:            "8px",
  },
  newBtn: {
    background:   "#4f46e5",
    color:        "#fff",
    border:       "none",
    borderRadius: "8px",
    padding:      "10px",
    cursor:       "pointer",
    fontWeight:   600,
    fontSize:     "14px",
    marginBottom: "8px",
  },
  list: {
    flex:      1,
    overflowY: "auto",
    display:   "flex",
    flexDirection: "column",
    gap:       "4px",
  },
  item: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "10px 12px",
    borderRadius:   "8px",
    cursor:         "pointer",
    color:          "#ccc",
    fontSize:       "13px",
    userSelect:     "none",
  },
  activeItem: {
    background: "#2a2a3e",
    color:      "#fff",
  },
  itemTitle: {
    overflow:     "hidden",
    textOverflow: "ellipsis",
    whiteSpace:   "nowrap",
    flex:         1,
  },
  deleteBtn: {
    background: "transparent",
    border:     "none",
    color:      "#666",
    cursor:     "pointer",
    fontSize:   "11px",
    padding:    "2px 4px",
    flexShrink: 0,
  },
  logoutBtn: {
    background:   "transparent",
    border:       "1px solid #444",
    color:        "#888",
    borderRadius: "8px",
    padding:      "8px",
    cursor:       "pointer",
    fontSize:     "13px",
  },
}
