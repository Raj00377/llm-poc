// import { useState } from "react"
// import { useAuth }     from "./hooks/useAuth"
// import { AuthPage }    from "./pages/AuthPage"
// import { Sidebar }     from "./components/Sidebar"
// import { ChatWindow }  from "./components/ChatWindow"

// export default function App() {
//   const { user, loading, login, register, logout } = useAuth()
//   const [convId, setConvId] = useState(null)

//   if (loading) {
//     return (
//       <div style={{ height: "100vh", display: "flex", alignItems: "center",
//                     justifyContent: "center", background: "#1e1e2e", color: "#888" }}>
//         Loading…
//       </div>
//     )
//   }

//   if (!user) {
//     return <AuthPage onLogin={login} onRegister={register} />
//   }

//   return (
//     <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
//       <Sidebar
//         activeConvId={convId}
//         onSelect={(id) => setConvId(id)}
//         onNew={(id)    => setConvId(id)}
//         onLogout={logout}
//       />

//       <main style={{ flex: 1, overflow: "hidden" }}>
//         {convId ? (
//           <ChatWindow convId={convId} />
//         ) : (
//           <div style={{ height: "100%", display: "flex", alignItems: "center",
//                         justifyContent: "center", background: "#1e1e2e", color: "#666",
//                         fontSize: "15px" }}>
//             Select a chat from the sidebar or start a new one.
//           </div>
//         )}
//       </main>
//     </div>
//   )
// }

// frontend/src/App.jsx
// frontend/src/App.jsx
import { useState, useMemo, useEffect } from "react";
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { Thread } from "./components/Thread";
import { Sidebar } from "./components/Sidebar";
import { AuthPage } from "./pages/AuthPage";
import { useAuth } from "./hooks/useAuth";
import { createDjangoAdapter } from "./lib/djangoAdapter";
import { useChat } from "./hooks/useChat";

function ChatApp({ convId }) {
  // useMemo so adapter isn't recreated on every render
  const adapter = useMemo(() => createDjangoAdapter(convId), [convId]);

  const { messages, send, streaming, error, loadMessages, loading } =
    useChat(convId);

  useEffect(() => {
    if (convId) loadMessages(convId);
  }, [convId]);

  if (loading) return <div>Loading...</div>;

  return <ChatRuntime key={convId} adapter={adapter} messages={messages} />;
}

function ChatRuntime({ adapter, messages }) {
  const runtime = useLocalRuntime(adapter, {
    initialMessages: messages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}

export default function App() {
  const { user, loading, login, register, logout } = useAuth();
  const [convId, setConvId] = useState(null);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-900 text-zinc-400">
        Loading…
      </div>
    );

  if (!user) return <AuthPage onLogin={login} onRegister={register} />;

  return (
    <div className="flex h-screen bg-zinc-900 overflow-hidden">
      <Sidebar
        activeConvId={convId}
        onSelect={setConvId}
        onNew={setConvId}
        onLogout={logout}
      />
      <main className="flex-1 overflow-hidden">
        {convId ? (
          <ChatApp key={convId} convId={convId} />
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Select a chat or start a new one
          </div>
        )}
      </main>
    </div>
  );
}
