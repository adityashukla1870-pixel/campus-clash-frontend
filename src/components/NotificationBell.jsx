import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiBell } from "react-icons/fi"
import API from "../api/axios"
import "./NotificationBell.css"

const ICONS = {
  payment: "💳",
  room: "🔑",
  winner: "🏆",
  info: "🔔"
}

function timeAgo(iso) {
  if (!iso) return ""
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const boxRef = useRef(null)

  const fetchNotifications = () => {
    API.get("/notifications/my")
      .then((res) => {
        setItems(res.data.notifications || [])
        setUnread(res.data.unread_count || 0)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 20000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0) {
      API.post("/notifications/read-all")
        .then(() => setUnread(0))
        .catch(() => {})
    }
  }

  const handleItemClick = (n) => {
    setOpen(false)
    if (n.tournament_id) navigate(`/tournament/${n.tournament_id}`)
  }

  return (
    <div className="notif-bell-wrap" ref={boxRef}>
      <div className="notif-bell" onClick={handleToggle}>
        <FiBell size={19} />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
      </div>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">Notifications</div>
          {items.length === 0 ? (
            <div className="notif-empty">You're all caught up 🎉</div>
          ) : (
            <div className="notif-list">
              {items.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item${n.read ? "" : " unread"}`}
                  onClick={() => handleItemClick(n)}
                >
                  <span className="notif-icon">{ICONS[n.type] || ICONS.info}</span>
                  <div className="notif-body">
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-time">{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
