import { useEffect, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiX } from "react-icons/fi"
import { useNotifications } from "../context/useNotifications"
import { playNotificationSound } from "../utils/notificationSound"
import "./NotificationPopup.css"

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"]

function NotificationPopup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { popupQueue, dismissPopup } = useNotifications()
  const [dismissedLocal, setDismissedLocal] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("cc_popup_dismissed") || "[]")) } catch { return new Set() }
  })
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem("token"))

  // The current popup is the first queue item this device hasn't dismissed.
  // Dismiss state comes from the server (per-user), plus a local set so a
  // dismissed popup disappears instantly without waiting for the refetch.
  const current = popupQueue.find(p => !dismissedLocal.has(p.id)) || null

  useEffect(() => {
    const check = () => setHasToken(!!localStorage.getItem("token"))
    window.addEventListener("storage", check)
    return () => window.removeEventListener("storage", check)
  }, [])

  // Play the chime once per announcement when it first becomes visible
  useEffect(() => {
    if (!current) return
    const key = "cc_popup_sounded_" + current.id
    if (!localStorage.getItem(key)) {
      playNotificationSound()
      localStorage.setItem(key, "1")
    }
  }, [current])

  const close = useCallback(async (id) => {
    setDismissedLocal(prev => {
      const next = new Set(prev)
      next.add(id)
      // keep the local set small â€” server tracks the durable state
      localStorage.setItem("cc_popup_dismissed", JSON.stringify(Array.from(next).slice(-100)))
      return next
    })
    try {
      await dismissPopup(id)
    } catch {
      // silent â€” server state will catch up on next poll
    }
  }, [dismissPopup])

  const handleClose = () => {
    if (current) close(current.id)
  }

  const handleAction = () => {
    if (!current) return
    const url = current.actionUrl
    close(current.id)
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
