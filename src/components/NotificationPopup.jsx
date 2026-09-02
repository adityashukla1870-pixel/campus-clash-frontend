import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiX } from "react-icons/fi"
import { useNotifications } from "../context/NotificationContext"
import { playNotificationSound } from "../utils/notificationSound"
import "./NotificationPopup.css"

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"]

function NotificationPopup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { popupQueue, dismissPopup } = useNotifications()
  const [current, setCurrent] = useState(null)
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem("token"))

  useEffect(() => {
    const check = () => setHasToken(!!localStorage.getItem("token"))
    window.addEventListener("storage", check)
    return () => window.removeEventListener("storage", check)
  }, [])

  useEffect(() => {
    if (popupQueue.length > 0 && !current) {
      const next = popupQueue[0]
      setCurrent(next)
      playNotificationSound()
    }
  }, [popupQueue, current])

  const handleClose = async () => {
    if (!current) return
    await dismissPopup(current.id)
    setCurrent(null)
  }

  const handleAction = async () => {
    if (!current) return
    const url = current.actionUrl
    await dismissPopup(current.id)
    setCurrent(null)
    if (url) {
      if (url.startsWith("http")) {
        window.open(url, "_blank")
      } else {
        navigate(url)
      }
    }
  }

  if (PUBLIC_PATHS.includes(location.pathname)) return null
  if (!current || !hasToken) return null

  return createPortal(
    <AnimatePresence>
      {current && hasToken && (
        <motion.div
          className="np-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          key="np-overlay"
        >
          <motion.div
            className="np-card"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
          >
            <button className="np-close" onClick={handleClose} aria-label="Close">
              <FiX size={20} />
            </button>

            <div className="np-header">
              <span className="np-brand">CAMPUS CLASH</span>
              <span className="np-type-badge">
                {current.type === "global_announcement" ? "ANNOUNCEMENT" :
                 current.type === "tournament" ? "TOURNAMENT ALERT" :
                 current.type === "specific_user" ? "MESSAGE FOR YOU" :
                 "NOTIFICATION"}
              </span>
            </div>

            {current.imageUrl && (
              <div className="np-image-wrap">
                <img
                  src={current.imageUrl}
                  alt={current.title}
                  className="np-image"
                  loading="lazy"
                />
              </div>
            )}

            <div className="np-content">
              <h2 className="np-title">{current.title}</h2>
              <p className="np-message">{current.message}</p>
            </div>

            <div className="np-actions">
              {current.actionLabel && current.actionUrl && (
                <button className="np-action-btn" onClick={handleAction}>
                  {current.actionLabel}
                </button>
              )}
              <button className="np-dismiss-btn" onClick={handleClose}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default NotificationPopup
