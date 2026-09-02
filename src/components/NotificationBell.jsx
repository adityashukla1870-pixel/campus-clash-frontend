import { useRef, useState } from "react"
import { FiBell } from "react-icons/fi"
import { useNotifications } from "../context/NotificationContext"
import NotificationCenter from "./NotificationCenter"
import "./NotificationBell.css"

function NotificationBell() {
  const token = localStorage.getItem("token")
  if (!token) return null

  const { unreadCount } = useNotifications()
  const [open, setOpen] = useState(false)
  const bellRef = useRef(null)

  return (
    <div className="notif-bell-wrap" ref={bellRef}>
      <div className="notif-bell" onClick={() => setOpen(!open)}>
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
