import { useRef, useState } from "react"
import { FiBell } from "react-icons/fi"
import { useNotifications } from "../context/useNotifications"
import NotificationCenter from "./NotificationCenter"
import "./NotificationBell.css"

function NotificationBell({ className }) {
  const token = localStorage.getItem("token")
  const [open, setOpen] = useState(false)
  const bellRef = useRef(null)
  const { unreadCount } = useNotifications() || {}

  if (!token) return null

  return (
    <div className={`notif-bell-wrap ${className || ""}`} ref={bellRef}>
      <div className="notif-bell" onClick={() => setOpen(!open)} title="Notifications">
        <FiBell size={19} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </div>

      <NotificationCenter
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={bellRef}
      />
    </div>
  )
}

export default NotificationBell
