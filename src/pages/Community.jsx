import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { jwtDecode } from "jwt-decode"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { getRole } from "../utils/auth"
import "./Community.css"

const ACCENTS = ["#a855f7", "#22d3ee", "#f59e0b", "#f472b6", "#4ade80", "#818cf8"]
const QUICK_EMOJIS = ["👍", "🔥", "😂", "❤️", "😮", "👀"]
const GAMES = ["BGMI", "Free Fire", "Valorant", "COD Mobile", "Other"]

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
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function extractMentions(text, members) {
  if (!text) return []
  const found = []
  members.forEach(m => {
    const re = new RegExp(`@${escapeRegExp(m.name)}\\b`, "i")
    if (re.test(text)) found.push(m.user_id)
  })
  return found
}

function renderMessageText(text) {
  if (!text) return null
  const parts = text.split(/(@[A-Za-z0-9_]+)/g)
  return parts.map((part, i) =>
    part.startsWith("@") && part.length > 1
      ? <span key={i} className="mention-tag">{part}</span>
      : <span key={i}>{part}</span>
  )
}

function Community() {
  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState("general")
  const [messages, setMessages] = useState([])
  const [hasMore, setHasMore] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)

  const [showPinned, setShowPinned] = useState(false)
  const [pinnedMessages, setPinnedMessages] = useState([])

  const [draft, setDraft] = useState("")
  const [online, setOnline] = useState(0)
  const [onlineMembers, setOnlineMembers] = useState([])
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [hoveredId, setHoveredId] = useState(null)

  const [replyingTo, setReplyingTo] = useState(null)
  const [attachedImage, setAttachedImage] = useState(null)
  const [attachedPreview, setAttachedPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState("")

  const [reportTarget, setReportTarget] = useState(null)
  const [reportReason, setReportReason] = useState("")

  const [muteTarget, setMuteTarget] = useState(null)
  const [muteMinutes, setMuteMinutes] = useState(10)

  const [showReports, setShowReports] = useState(false)
  const [reports, setReports] = useState([])

  const [lfgGame, setLfgGame] = useState("")
  const [lfgRank, setLfgRank] = useState("")
  const [lfgMic, setLfgMic] = useState(true)
  const [lfgSlots, setLfgSlots] = useState(1)

  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const activeChannelRef = useRef(activeChannel)
  const lastTypingEmitRef = useRef(0)

  const token = localStorage.getItem("token")
  let myUserId = ""
  try { myUserId = token ? jwtDecode(token).sub : "" } catch { myUserId = "" }
  const role = getRole()

  useEffect(() => { activeChannelRef.current = activeChannel }, [activeChannel])

  // Load channel list once
  useEffect(() => {
    API.get("/chat/channels").then(res => setChannels(res.data || [])).catch(() => {})
  }, [])

  // Socket lifecycle — connect once
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket", "polling"]
    })
    socketRef.current = socket

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))

    socket.on("presence_update", (data) => {
      setOnline(data.count)
      setOnlineMembers(data.members || [])
    })

    socket.on("new_message", (msg) => {
      if (msg.channel === activeChannelRef.current) {
        setMessages(prev => [...prev, msg])
      }
    })

    socket.on("message_edited", (data) => {
      setMessages(prev => prev.map(m => m.id === data.id ? { ...m, message: data.message, edited_at: data.edited_at } : m))
    })

    socket.on("message_deleted", (data) => {
      setMessages(prev => prev.map(m => m.id === data.id ? { ...m, deleted: true, message: "", image_url: null } : m))
    })

    socket.on("reaction_update", (data) => {
      setMessages(prev => prev.map(m => m.id === data.id ? { ...m, reactions: data.reactions } : m))
    })

    socket.on("message_pinned", (data) => {
      setMessages(prev => prev.map(m => m.id === data.id ? { ...m, pinned: data.pinned } : m))
    })

    socket.on("user_typing", (data) => {
      setTypingUsers(prev => [...prev.filter(u => u.user_id !== data.user_id), { ...data, at: Date.now() }])
    })

    socket.on("chat_error", (data) => alert(data.error))

    return () => socket.disconnect()
  }, [])

  // Clear stale typing indicators
  useEffect(() => {
    const t = setInterval(() => {
      setTypingUsers(prev => prev.filter(u => Date.now() - u.at < 3000))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // Load a channel's history whenever it changes (or once the socket connects)
  useEffect(() => {
    setMessages([])
    setHasMore(false)
    setShowPinned(false)
    setReplyingTo(null)
    setEditingId(null)

    if (socketRef.current) {
      socketRef.current.emit("join_channel", { channel: activeChannel })
    }

    API.get(`/chat/history/${activeChannel}`).then(res => {
      setMessages(res.data.messages || [])
      setHasMore(res.data.has_more)
    }).catch(() => {})
  }, [activeChannel, connected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const activeChannelMeta = channels.find(c => c.key === activeChannel)

  // ---------------- ACTIONS ----------------

  const handleDraftChange = (e) => {
    const val = e.target.value
    setDraft(val)
    const now = Date.now()
    if (now - lastTypingEmitRef.current > 2000 && socketRef.current) {
      socketRef.current.emit("typing", { channel: activeChannel })
      lastTypingEmitRef.current = now
    }
  }

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { alert("Image too large (max 5MB)"); return }
    setAttachedImage(f)
    setAttachedPreview(URL.createObjectURL(f))
  }

  const removeAttachedImage = () => {
    setAttachedImage(null)
    setAttachedPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const sendMessage = async () => {
    const text = draft.trim()
    if ((!text && !attachedImage) || !socketRef.current) return

    let imageUrl = null
    if (attachedImage) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append("file", attachedImage)
        const res = await API.post("/chat/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        imageUrl = res.data.url
      } catch (err) {
        alert(err.response?.data?.error || "Image upload failed")
        setUploading(false)
        return
      }
      setUploading(false)
    }

    socketRef.current.emit("send_message", {
      channel: activeChannel,
      message: text,
      image_url: imageUrl,
      reply_to: replyingTo,
      mentions: extractMentions(text, onlineMembers)
    })

    setDraft("")
    removeAttachedImage()
    setReplyingTo(null)
  }

  const sendLfgPost = () => {
    if (!lfgGame.trim()) { alert("Select a game first"); return }
    if (!socketRef.current) return
    socketRef.current.emit("send_message", {
      channel: "lfg",
      message: draft.trim(),
      lfg: { game: lfgGame, rank: lfgRank, mic: lfgMic, slots_needed: Number(lfgSlots) || 1 }
    })
    setDraft("")
    setLfgRank("")
  }

  const joinLfgPost = (msg) => {
    if (!socketRef.current) return
    socketRef.current.emit("send_message", {
      channel: "lfg",
      message: `🙋 I'm in for your ${msg.lfg?.game || "squad"}!`,
      reply_to: { id: msg.id, name: msg.name, message: msg.message },
      mentions: [msg.user_id]
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const loadOlder = async () => {
    if (messages.length === 0) return
    setLoadingOlder(true)
    try {
      const oldestId = messages[0].id
      const res = await API.get(`/chat/history/${activeChannel}`, { params: { before: oldestId } })
      setMessages(prev => [...(res.data.messages || []), ...prev])
      setHasMore(res.data.has_more)
    } catch {
      // ignore
    } finally {
      setLoadingOlder(false)
    }
  }

  const togglePinnedPanel = () => {
    const next = !showPinned
    setShowPinned(next)
    if (next) {
      API.get(`/chat/pinned/${activeChannel}`).then(res => setPinnedMessages(res.data || [])).catch(() => {})
    }
  }

  const toggleReaction = (messageId, emoji) => {
    socketRef.current?.emit("react_message", { message_id: messageId, emoji })
  }

  const startEdit = (msg) => { setEditingId(msg.id); setEditDraft(msg.message) }

  const submitEdit = () => {
    if (!editDraft.trim()) return
    socketRef.current?.emit("edit_message", { message_id: editingId, message: editDraft.trim() })
    setEditingId(null)
    setEditDraft("")
  }

  const deleteMessage = (messageId) => {
    if (!confirm("Delete this message?")) return
    socketRef.current?.emit("delete_message", { message_id: messageId })
  }

  const togglePin = (messageId) => socketRef.current?.emit("toggle_pin", { message_id: messageId })

  const submitReport = async () => {
    if (!reportTarget) return
    try {
      await API.post("/chat/report", { message_id: reportTarget, reason: reportReason })
      alert("Reported. Thanks — our admins will take a look.")
    } catch (err) {
      alert(err.response?.data?.error || "Could not submit report")
    }
    setReportTarget(null)
    setReportReason("")
  }

  const openReports = () => {
    setShowReports(true)
    API.get("/chat/admin/reports").then(res => setReports(res.data || [])).catch(() => {})
  }

  const resolveReport = (id) => {
    API.post(`/chat/admin/reports/${id}/resolve`).then(() => {
      setReports(prev => prev.filter(r => r.id !== id))
    })
  }

  const submitMute = () => {
    if (!muteTarget) return
    socketRef.current?.emit("admin_mute_user", { user_id: muteTarget.user_id, minutes: Number(muteMinutes) || 10 })
    setMuteTarget(null)
  }

  const banUser = (userId) => {
    if (!confirm("Ban this user from chat?")) return
    socketRef.current?.emit("admin_ban_user", { user_id: userId })
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
            <p># {activeChannelMeta?.name || activeChannel} — {activeChannelMeta?.description || "hang out with fellow players"}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {role === "admin" && (
              <button className="reports-btn" onClick={openReports}>🚩 Reports</button>
            )}
            <div className={`presence-pill ${connected ? "live" : ""}`}>
              <span className="presence-dot" />
              {connected ? `${online} online` : "connecting..."}
            </div>
          </div>
        </div>

        <div className="community-layout">
          <div className="channel-sidebar">
            <div className="channel-sidebar-label">Channels</div>
            {channels.map(c => (
              <button
                key={c.key}
                className={`channel-btn ${activeChannel === c.key ? "active" : ""}`}
                onClick={() => setActiveChannel(c.key)}
              >
                <span className="channel-icon">{c.icon}</span>
                <span className="channel-name">{c.name}</span>
                {c.admin_only_post && <span className="channel-lock" title="Admin-only posting">🔒</span>}
              </button>
            ))}
          </div>

          <div className="chat-panel">
            <div className="pinned-bar" onClick={togglePinnedPanel}>
              📌 {showPinned ? "Hide pinned messages" : "View pinned messages"}
            </div>

            {showPinned && (
              <div className="pinned-panel">
                {pinnedMessages.length === 0 && <div className="chat-empty">No pinned messages yet</div>}
                {pinnedMessages.map(m => (
                  <div key={m.id} className="pinned-item">
                    <b style={{ color: colorForUser(m.user_id) }}>{m.name}</b>: {m.message}
                  </div>
                ))}
              </div>
            )}

            <div className="chat-messages">
              {hasMore && (
                <button className="load-older-btn" onClick={loadOlder} disabled={loadingOlder}>
                  {loadingOlder ? "Loading..." : "⬆ Load older messages"}
                </button>
              )}

              {grouped.length === 0 && (
                <div className="chat-empty">No messages yet — say hi to your fellow players 👋</div>
              )}

              {grouped.map((group, gi) => (
                <div className="msg-group" key={gi}>
                  <div className="msg-avatar" style={{ background: colorForUser(group.user_id) }}>
                    {initials(group.name)}
                  </div>
                  <div className="msg-group-body">
                    <div className="msg-group-header">
                      <span className="msg-name" style={{ color: colorForUser(group.user_id) }}>{group.name}</span>
                      {group.role === "admin" && <span className="msg-badge">ADMIN</span>}
                      {group.items[0].is_champion && <span className="msg-badge champion">🏆 CHAMPION</span>}
                      <span className="msg-time">{formatTime(group.items[0].created_at)}</span>
                    </div>

                    {group.items.map(m => (
                      <div
                        key={m.id}
                        className="msg-row"
                        onMouseEnter={() => setHoveredId(m.id)}
                        onMouseLeave={() => setHoveredId(prev => prev === m.id ? null : prev)}
                      >
                        {m.reply_to && (
                          <div className="reply-preview">↪ replying to <b>{m.reply_to.name}</b>: {m.reply_to.message}</div>
                        )}

                        {m.lfg && (
                          <div className="lfg-card">
                            <div className="lfg-card-header">🎯 {m.lfg.game} · {m.lfg.rank || "Any rank"}</div>
                            <div className="lfg-card-meta">
                              {m.lfg.mic ? "🎤 Mic on" : "🔇 No mic"} · needs {m.lfg.slots_needed} more
                            </div>
                            {m.user_id !== myUserId && (
                              <button className="lfg-join-btn" onClick={() => joinLfgPost(m)}>🙋 I'm in</button>
                            )}
                          </div>
                        )}

                        {m.deleted ? (
                          <div className="msg-text msg-deleted">[message deleted]</div>
                        ) : editingId === m.id ? (
                          <div className="edit-box">
                            <input
                              className="edit-input"
                              value={editDraft}
                              onChange={e => setEditDraft(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") submitEdit(); if (e.key === "Escape") setEditingId(null) }}
                              autoFocus
                            />
                            <button onClick={submitEdit}>Save</button>
                            <button onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            {m.message && (
                              <div className="msg-text">
                                {renderMessageText(m.message)}
                                {m.edited_at && <span className="msg-edited-tag"> (edited)</span>}
                              </div>
                            )}
                            {m.image_url && (
                              <img
                                className="msg-image"
                                src={`${import.meta.env.VITE_API_URL}${m.image_url}`}
                                alt="attachment"
                              />
                            )}
                          </>
                        )}

                        {!m.deleted && Object.entries(m.reactions || {}).some(([, users]) => users.length > 0) && (
                          <div className="reaction-row">
                            {Object.entries(m.reactions || {}).filter(([, users]) => users.length > 0).map(([emoji, users]) => (
                              <button
                                key={emoji}
                                className={`reaction-pill ${users.includes(myUserId) ? "mine" : ""}`}
                                onClick={() => toggleReaction(m.id, emoji)}
                              >
                                {emoji} {users.length}
                              </button>
                            ))}
                          </div>
                        )}

                        {!m.deleted && hoveredId === m.id && (
                          <div className="msg-toolbar">
                            {QUICK_EMOJIS.map(e => (
                              <button key={e} className="toolbar-btn" onClick={() => toggleReaction(m.id, e)}>{e}</button>
                            ))}
                            <button className="toolbar-btn" onClick={() => setReplyingTo({ id: m.id, name: m.name, message: m.message })} title="Reply">↪</button>
                            {m.user_id === myUserId && !m.image_url && (
                              <button className="toolbar-btn" onClick={() => startEdit(m)} title="Edit">✏️</button>
                            )}
                            {(m.user_id === myUserId || role === "admin") && (
                              <button className="toolbar-btn" onClick={() => deleteMessage(m.id)} title="Delete">🗑</button>
                            )}
                            {m.user_id !== myUserId && (
                              <button className="toolbar-btn" onClick={() => setReportTarget(m.id)} title="Report">🚩</button>
                            )}
                            {role === "admin" && (
                              <>
                                <button className="toolbar-btn" onClick={() => togglePin(m.id)} title="Pin">📌</button>
                                {m.user_id !== myUserId && (
                                  <>
                                    <button className="toolbar-btn" onClick={() => setMuteTarget({ user_id: m.user_id, name: m.name })} title="Mute">🔇</button>
                                    <button className="toolbar-btn" onClick={() => banUser(m.user_id)} title="Ban">🚫</button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  {typingUsers.map(u => u.name).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {replyingTo && (
              <div className="replying-bar">
                ↪ Replying to <b>{replyingTo.name}</b>
                <button onClick={() => setReplyingTo(null)}>✕</button>
              </div>
            )}

            {attachedPreview && (
              <div className="attach-preview-bar">
                <img src={attachedPreview} alt="preview" />
                <button onClick={removeAttachedImage}>✕</button>
              </div>
            )}

            {activeChannel === "lfg" ? (
              <div className="lfg-composer">
                <select value={lfgGame} onChange={e => setLfgGame(e.target.value)}>
                  <option value="">Select game</option>
                  {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input placeholder="Rank (optional)" value={lfgRank} onChange={e => setLfgRank(e.target.value)} />
                <label className="mic-checkbox">
                  <input type="checkbox" checked={lfgMic} onChange={e => setLfgMic(e.target.checked)} /> Mic
                </label>
                <input
                  type="number" min="1" max="10" value={lfgSlots}
                  onChange={e => setLfgSlots(e.target.value)}
                  style={{ width: 56 }}
                />
                <input
                  className="lfg-note-input"
                  placeholder="Add a note (optional)"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                />
                <button className="chat-send-btn" onClick={sendLfgPost}>Post</button>
              </div>
            ) : (
              <div className="chat-input-row">
                <button className="attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach image">📎</button>
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileSelect} />
                <textarea
                  className="chat-input"
                  placeholder={`Message #${activeChannel}...`}
                  value={draft}
                  onChange={handleDraftChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  maxLength={500}
                />
                <button
                  className="chat-send-btn"
                  onClick={sendMessage}
                  disabled={(!draft.trim() && !attachedImage) || uploading}
                >
                  {uploading ? "..." : "Send"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {reportTarget && (
        <div className="modal-overlay" onClick={() => setReportTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>🚩 Report message</h3>
            <textarea
              placeholder="Why are you reporting this? (optional)"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setReportTarget(null)}>Cancel</button>
              <button className="btn-primary" onClick={submitReport}>Submit report</button>
            </div>
          </div>
        </div>
      )}

      {muteTarget && (
        <div className="modal-overlay" onClick={() => setMuteTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>🔇 Mute {muteTarget.name}</h3>
            <label>Minutes</label>
            <input type="number" min="1" value={muteMinutes} onChange={e => setMuteMinutes(e.target.value)} />
            <div className="modal-actions">
              <button onClick={() => setMuteTarget(null)}>Cancel</button>
              <button className="btn-primary" onClick={submitMute}>Mute</button>
            </div>
          </div>
        </div>
      )}

      {showReports && (
        <div className="modal-overlay" onClick={() => setShowReports(false)}>
          <div className="modal-box reports-box" onClick={e => e.stopPropagation()}>
            <h3>🚩 Chat Reports</h3>
            {reports.length === 0 && <p className="chat-empty">No open reports 🎉</p>}
            {reports.map(r => (
              <div key={r.id} className="report-item">
                <div>
                  <b style={{ color: colorForUser(r.message_author_id) }}>{r.message_author_name}</b> in #{r.channel}: "{r.message_snapshot}"
                </div>
                <div className="report-meta">Reported by {r.reporter_name} — {r.reason}</div>
                <button className="resolve-btn" onClick={() => resolveReport(r.id)}>Mark resolved</button>
              </div>
            ))}
            <button className="modal-close-btn" onClick={() => setShowReports(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}

export default Community
