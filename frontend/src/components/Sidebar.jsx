/**
 * Sidebar — custom thread list using our Django REST API
 *
 * This replaces the assistant-ui ThreadListSidebar because our Django backend
 * exposes a simple REST API for conversations, not the assistant-ui thread
 * list protocol. The ThreadListPrimitive requires the runtime to implement
 * thread switching natively (via useExternalStoreRuntime with thread support),
 * which needs significant backend changes.
 *
 * This component gives us the same UX using our existing API.
 */
import { useState, useEffect } from "react"
import { PlusIcon, MessageSquareIcon, Trash2Icon, LogOutIcon } from "lucide-react"
import { cn } from "../lib/utils"

function getCookie(name) {
  return document.cookie.split("; ").find(r => r.startsWith(name + "="))?.split("=")[1]
}

export function Sidebar({ activeConvId, onSelect, onNew, onLogout, refreshKey }) {
  const [conversations, setConversations] = useState([])
  const [hoveredId,     setHoveredId]     = useState(null)

  const load = async () => {
    const res  = await fetch("/api/conversations/", { credentials: "include" })
    const data = await res.json()
    setConversations(data.conversations || [])
  }

  useEffect(() => { load() }, [activeConvId, refreshKey])

  const newChat = async () => {
    const res  = await fetch("/api/conversations/", {
      method: "POST", credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    })
    const data = await res.json()
    onNew(data.id)
  }

  const deleteConv = async (e, id) => {
    e.stopPropagation()
    await fetch(`/api/conversations/${id}/`, {
      method: "DELETE", credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    })
    if (id === activeConvId) onNew(null)
    load()
  }

  return (
    <aside className="flex h-full w-64 min-w-64 flex-col border-r border-black/8 bg-white">

      {/* Header */}
      <div className="flex items-center px-4 py-3.5 border-b border-black/8">
        <span className="text-sm font-semibold text-color tracking-tight">
          ✦ AI Module
        </span>
      </div>

      {/* New thread button */}
      <div className="p-2 pb-0">
        <button
          onClick={newChat}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary-accent/6 hover:text-primary/6 transition-colors cursor-pointer border-none bg-transparent text-left"
        >
          <PlusIcon size={15} className="shrink-0" />
          New Thread
        </button>
      </div>

      {/* Thread list */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {conversations.length === 0 && (
          <p className="mt-4 text-center text-xs text-color">No threads yet</p>
        )}

        {conversations.map((c) => {
          const isActive  = c.id === activeConvId
          const isHovered = hoveredId === c.id
          return (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group flex items-center gap-1 rounded-lg transition-colors cursor-pointer",
                isActive
                  ? "bg-primary-accent"
                  : "hover:bg-purple-50"
              )}
              
            >
              <button className="flex flex-1 items-center gap-2 truncate px-3 py-2 text-sm border-none text-left cursor-pointer">
                <MessageSquareIcon
                  size={13}
                  className={cn("shrink-0", isActive ? "text-primary" : "text-color")}
                />
                <span className={cn("truncate", isActive ? "text-primary bg-primary-accent" : "text-color")}>
                  {c.title || "New Thread"}
                </span>
              </button>

              {(isActive || isHovered) && (
                <button
                  onClick={(e) => deleteConv(e, c.id)}
                  className="mr-1.5 flex size-6 shrink-0 items-center justify-center rounded-md text-primary hover:bg-primary-accent hover:text-red-400 transition-colors cursor-pointer border-none"
                >
                  <Trash2Icon size={13} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 p-2">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-primary hover:bg-white/6 hover:text-[#ececec] transition-colors cursor-pointer border-none bg-transparent text-left"
        >
          <LogOutIcon size={14} className="shrink-0" />
          Sign out
        </button>
      </div>

    </aside>
  )
}