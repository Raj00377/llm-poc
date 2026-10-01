import { useState } from "react"
import { useAuth }     from "./hooks/useAuth"
import { AuthPage }    from "./pages/AuthPage"
import { Sidebar }     from "./components/Sidebar"
import { ChatWindow }  from "./components/ChatWindow"

export default function App() {
  const { user, loading, login, register, logout } = useAuth()
  const [convId, setConvId] = useState(null)

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center",
                    justifyContent: "center", background: "#1e1e2e", color: "#888" }}>
        Loading…
      </div>
    )
  }

  if (!user) {
    return <AuthPage onLogin={login} onRegister={register} />
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        activeConvId={convId}
        onSelect={(id) => setConvId(id)}
        onNew={(id)    => setConvId(id)}
        onLogout={logout}
      />

      <main style={{ flex: 1, overflow: "hidden" }}>
        {convId ? (
          <ChatWindow convId={convId} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center",
                        justifyContent: "center", background: "#1e1e2e", color: "#666",
                        fontSize: "15px" }}>
            Select a chat from the sidebar or start a new one.
          </div>
        )}
      </main>
    </div>
  )
}
