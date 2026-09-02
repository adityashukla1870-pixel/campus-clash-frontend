import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { FiBell, FiCreditCard, FiKey, FiAward, FiInfo, FiCheckCircle, FiImage } from "react-icons/fi"
import { useNotifications } from "../context/NotificationContext"
import "./NotificationCenter.css"

const ICONS = {
  payment: FiCreditCard,
  room: FiKey,
  winner: FiAward,
  info: FiBell,
  group: FiInfo,
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

function NotificationCenter({ open, onClose, anchorRef }) {
  const navigate = useNavigate()
  const {
    announcements,
    systemNotifications,
    unreadCount,
    markRead,
    markAllRead,
    markSystemRead,
    markAllSystemRead,
    loading,
  } = useNotifications()
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e) => {
      const clickedAnchor = anchorRef?.current?.contains(e.target)
      const clickedDropdown = dropdownRef.current?.contains(e.target)
      if (!clickedAnchor && !clickedDropdown) onClose()
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open, onClose, anchorRef])

  const announcementItems = announcements.filter(a => a.showInCenter)

  const handleSystemClick = async (n) => {
    onClose()
    if (!n.read) await markSystemRead(n.id)
    if (!n.tournament_id) return
    if (n.type === "room") {
      navigate(`/room/${n.tournament_id}`)
    } else if (n.type === "winner" || n.type === "payment") {
      navigate("/my-tournaments")
    } else {
      navigate(`/tournament/${n.tournament_id}`)
    }
  }

  const handleAnnouncementClick = async (a) => {
    onClose()
    if (!a.seen) await markRead(a.id)
    if (a.actionUrl) {
      if (a.actionUrl.startsWith("http")) {
        window.open(a.actionUrl, "_blank")
      } else {
        navigate(a.actionUrl)
      }
    }
  }

  const handleMarkAll = async () => {
    await markAllRead()
    await markAllSystemRead()
  }

  if (!open || !localStorage.getItem("token")) return null

  const isEmpty = announcementItems.length === 0 && systemNotifications.length === 0

  return createPortal(
    <div className="nc-dropdown" ref={dropdownRef}>
      <div className="nc-header">
        <span className="nc-header-title">Notifications</span>
        {unreadCount > 0 && (
          <button className="nc-mark-all" onClick={handleMarkAll}>
            <FiCheckCircle size={14} />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="nc-empty">
          <span>Loading...</span>
        </div>
      ) : isEmpty ? (
        <div className="nc-empty">
          <FiBell size={32} style={{ opacity: 0.3 }} />
          <span>You're all caught up</span>
        </div>
      ) : (
        <div className="nc-list">
          {announcementItems.map((a) => (
            <div
              key={`ann-${a.id}`}
              className={`nc-item${a.seen ? "" : " unread"}`}
              onClick={() => handleAnnouncementClick(a)}
            >
              <div className="nc-item-icon-wrap" style={{ background: "var(--purple-glow)" }}>
                <FiBell size={16} style={{ color: "var(--purple)" }} />
              </div>
              <div className="nc-item-body">
                <div className="nc-item-top">
                  <span className="nc-item-title">{a.title}</span>
                  {!a.seen && <span className="nc-dot" />}
                </div>
                <div className="nc-item-message">{a.message}</div>
                <div className="nc-item-meta">
                  <span className="nc-item-time">{timeAgo(a.createdAt)}</span>
                  {a.imageUrl && <FiImage size={10} />}
                  {a.actionLabel && <span className="nc-item-action-tag">{a.actionLabel}</span>}
                </div>
              </div>
            </div>
          ))}

          {systemNotifications.map((n) => {
            const Icon = ICONS[n.type] || ICONS.info
            return (
              <div
                key={`sys-${n.id}`}
                className={`nc-item${n.read ? "" : " unread"}`}
                onClick={() => handleSystemClick(n)}
              >
                <div className="nc-item-icon-wrap" style={{ background: "var(--cyan-glow)" }}>
                  <Icon size={16} style={{ color: "var(--cyan)" }} />
                </div>
                <div className="nc-item-body">
                  <div className="nc-item-top">
                    <span className="nc-item-message-text">{n.message}</span>
                    {!n.read && <span className="nc-dot" />}
                  </div>
                  <div className="nc-item-meta">
                    <span className="nc-item-time">{timeAgo(n.created_at)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>,
    document.body
  )
}

export default NotificationCenter
