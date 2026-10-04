import { useState, useEffect } from "react"
import { MessageSquare, Plus, Trash2, LogOut } from "lucide-react"
import { cn } from "../lib/utils"

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
      headers:     { "X-CSRFToken": getCookie("csrftoken") },
    })
    const data = await res.json()
    onNew(data.id)
  }

  const deleteConv = async (e, id) => {
    e.stopPropagation()
    await fetch(`/api/conversations/${id}/`, {
      method:      "DELETE",
      credentials: "include",
      headers:     { "X-CSRFToken": getCookie("csrftoken") },
    })
    if (id === activeConvId) onNew(null)
    load()
  }

  return (
    <aside className="flex w-64 min-w-64 flex-col gap-2 border-r border-[var(--color-border)] bg-[#171717] p-3">

      <button
        onClick={newChat}
        className="flex w-full items-center gap-2 rounded-lg bg-[var(--color-muted)] px-3 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-accent)] cursor-pointer border-none"
      >
        <Plus size={16} />
        New Chat
      </button>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {conversations.length === 0 && (
          <p className="mt-6 text-center text-xs text-[var(--color-muted-foreground)]">No conversations yet</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              "group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              c.id === activeConvId
                ? "bg-[var(--color-muted)] text-[var(--color-foreground)]"
                : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            )}
          >
            <MessageSquare size={14} className="shrink-0 opacity-60" />
            <span className="flex-1 truncate">{c.title || "Untitled"}</span>
            <button
              onClick={(e) => deleteConv(e, c.id)}
              className="hidden group-hover:flex items-center text-[var(--color-muted-foreground)] hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-0.5 rounded"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] cursor-pointer bg-transparent"
      >
        <LogOut size={14} />
        Sign out
      </button>
    </aside>
  )
}