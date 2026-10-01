import { useState, useEffect } from "react"

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1]
}

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me/", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const res = await fetch("/api/auth/login/", {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken":  getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (res.ok) { setUser(data); return { ok: true } }
    return { ok: false, error: data.error }
  }

  const register = async (username, password) => {
    const res = await fetch("/api/auth/register/", {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken":  getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (res.ok) { setUser(data); return { ok: true } }
    return { ok: false, error: data.error }
  }

  const logout = async () => {
    await fetch("/api/auth/logout/", {
      method:      "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    })
    setUser(null)
  }

  return { user, loading, login, register, logout }
}
