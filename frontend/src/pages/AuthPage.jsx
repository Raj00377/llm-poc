import { useState } from "react"

export function AuthPage({ onLogin, onRegister }) {
  const [mode,     setMode]     = useState("login")   // "login" | "register"
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")

  const submit = async () => {
    setError("")
    const fn     = mode === "login" ? onLogin : onRegister
    const result = await fn(username, password)
    if (!result.ok) setError(result.error || "Something went wrong")
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>💬 ChatGPT Clone</h1>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(mode === "login"    ? styles.activeTab : {}) }}
            onClick={() => setMode("login")}
          >Sign in</button>
          <button
            style={{ ...styles.tab, ...(mode === "register" ? styles.activeTab : {}) }}
            onClick={() => setMode("register")}
          >Register</button>
        </div>

        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.btn} onClick={submit}>
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    height:         "100vh",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    background:     "#1e1e2e",
  },
  card: {
    background:   "#2a2a3e",
    padding:      "40px",
    borderRadius: "16px",
    width:        "360px",
    display:      "flex",
    flexDirection:"column",
    gap:          "16px",
  },
  title: {
    color:     "#fff",
    margin:    0,
    fontSize:  "22px",
    textAlign: "center",
  },
  tabs: {
    display: "flex",
    gap:     "8px",
  },
  tab: {
    flex:         1,
    padding:      "8px",
    borderRadius: "8px",
    border:       "1px solid #444",
    background:   "transparent",
    color:        "#888",
    cursor:       "pointer",
    fontSize:     "14px",
  },
  activeTab: {
    background: "#4f46e5",
    color:      "#fff",
    border:     "1px solid #4f46e5",
  },
  input: {
    padding:      "12px",
    borderRadius: "8px",
    border:       "1px solid #444",
    background:   "#16161e",
    color:        "#e0e0e0",
    fontSize:     "14px",
    outline:      "none",
  },
  btn: {
    padding:      "12px",
    borderRadius: "8px",
    border:       "none",
    background:   "#4f46e5",
    color:        "#fff",
    cursor:       "pointer",
    fontWeight:   600,
    fontSize:     "15px",
  },
  error: {
    color:  "#f87171",
    margin: 0,
    fontSize: "13px",
  },
}
