import React    from "react"
import ReactDOM  from "react-dom/client"
import App       from "./App"
import './index.css';

// Global reset
const style = document.createElement("style")
style.textContent = `
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
