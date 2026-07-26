import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import "./Community.css"

const ACCENTS = ["#a855f7", "#22d3ee", "#f59e0b", "#f472b6", "#4ade80", "#818cf8"]

function colorForUser(userId) {
  if (!userId) return ACCENTS[0]
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  return ACCENTS[Math.abs(hash) % ACCENTS.length]
}

function initials(name) {
  return (name || "?").trim().slice(0, 1).toUpperCase()
}

function formatTime(iso) {
  if (!iso) return ""
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function Community() {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState("")
  const [online, setOnline] = useState(0)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    // Load recent history first so the room isn't empty while socket connects
    API.get("/chat/history").then(res => setMessages(res.data || [])).catch(() => {})

    const token = localStorage.getItem("token")
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ["websocket", "polling"]
    })
    socketRef.current = socket

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))
    socket.on("presence_update", (data) => setOnline(data.count))
    socket.on("new_message", (msg) => setMessages(prev => [...prev, msg]))

    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    const text = draft.trim()
    if (!text || !socketRef.current) return
    socketRef.current.emit("send_message", { message: text })
    setDraft("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Group consecutive messages from the same sender (Discord-style)
  const grouped = messages.reduce((acc, m) => {
    const last = acc[acc.length - 1]
    if (last && last.user_id === m.user_id && last.items.length < 8) {
      last.items.push(m)
    } else {
      acc.push({ user_id: m.user_id, name: m.name, role: m.role, items: [m] })
    }
    return acc
  }, [])

  return (
    <>
      <Navbar />
      <div className="community-page">
        <div className="community-header">
          <div>
            <h1>💬 Community</h1>
            <p># general — find teammates, talk strategy, hang out</p>
          </div>
          <div className={`presence-pill ${connected ? "live" : ""}`}>
            <span className="presence-dot" />
            {connected ? `${online} online` : "connecting..."}
          </div>
        </div>

        <div className="chat-panel">
          <div className="chat-messages">
            {grouped.length === 0 && (
              <div className="chat-empty">No messages yet — say hi to your fellow players 👋</div>
            )}
            {grouped.map((group, gi) => (
              <div className="msg-group" key={gi}>
                <div
                  className="msg-avatar"
                  style={{ background: colorForUser(group.user_id) }}
                >
                  {initials(group.name)}
                </div>
                <div className="msg-group-body">
                  <div className="msg-group-header">
                    <span className="msg-name" style={{ color: colorForUser(group.user_id) }}>
                      {group.name}
                    </span>
                    {group.role === "admin" && <span className="msg-badge">ADMIN</span>}
                    <span className="msg-time">{formatTime(group.items[0].created_at)}</span>
                  </div>
                  {group.items.map((m) => (
                    <div className="msg-text" key={m.id}>{m.message}</div>
                  ))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <textarea
              className="chat-input"
              placeholder="Message #general..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={500}
            />
            <button className="chat-send-btn" onClick={sendMessage} disabled={!draft.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Community
