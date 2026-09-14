import { useEffect, useState, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiX, FiStar, FiCheckCircle } from "react-icons/fi"
import API from "../api/axios"
import "./FeedbackLauncher.css"

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"]

function FeedbackLauncher() {
  const location = useLocation()
  const [pending, setPending] = useState([])
  const [current, setCurrent] = useState(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem("token"))
  const dismissedRef = useRef(new Set())

  useEffect(() => {
    const check = () => setHasToken(!!localStorage.getItem("token"))
    window.addEventListener("storage", check)
    return () => window.removeEventListener("storage", check)
  }, [])

  const fetchPending = useCallback(() => {
    if (!hasToken) return
    API.get("/feedbacks/pending-launcher")
      .then(res => {
        const items = res.data?.pending || []
        setPending(items)
        if (items.length > 0 && !current) {
          const next = items.find(item => !dismissedRef.current.has(item.tournament_id))
          if (next) setCurrent(next)
        }
      })
      .catch(() => {})
  }, [hasToken])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  const resetForm = () => {
    setRating(0)
    setHover(0)
    setComment("")
    setError("")
    setSuccess(false)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      await API.post("/feedbacks", {
        tournament_id: current.tournament_id,
        rating,
        comment,
      })
      setSuccess(true)
      setTimeout(() => {
        const remaining = pending.filter(p => p.tournament_id !== current.tournament_id)
        setPending(remaining)
        if (remaining.length > 0) {
          const next = remaining.find(item => !dismissedRef.current.has(item.tournament_id))
          if (next) {
            setCurrent(next)
            resetForm()
          } else {
            setCurrent(null)
          }
        } else {
          setCurrent(null)
        }
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (current) dismissedRef.current.add(current.tournament_id)
    setCurrent(null)
    resetForm()
  }

  if (PUBLIC_PATHS.includes(location.pathname)) return null
  if (!current || !hasToken) return null

  return createPortal(
    <AnimatePresence>
      {current && hasToken && (
        <motion.div
          className="fl-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          key="fl-overlay"
        >
          <motion.div
            className="fl-card"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Feedback"
          >
            <button className="fl-close" onClick={handleClose} aria-label="Close">
              <FiX size={20} />
            </button>

            <div className="fl-header">
              <span className="fl-brand">CAMPUS CLASH</span>
              <span className="fl-type-badge">TOURNAMENT FEEDBACK</span>
            </div>

            {success ? (
              <div className="fl-success-content">
                <div className="fl-success-icon">
                  <FiCheckCircle size={48} />
                </div>
                <h2 className="fl-title">Thank You!</h2>
                <p className="fl-message">Your feedback has been submitted successfully.</p>
              </div>
            ) : (
              <>
                <div className="fl-content">
                  <h2 className="fl-title">{current.tournament_name}</h2>
                  <p className="fl-message">
                    This tournament has ended. Share your experience to help us improve!
                  </p>

                  <div className="fl-rating">
                    <p className="fl-rating-label">Your Rating</p>
                    <div className="fl-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`fl-star ${star <= (hover || rating) ? "fl-star-active" : ""}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                        >
                          <FiStar size={28} fill={star <= (hover || rating) ? "var(--gold)" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="fl-comment">
                    <label className="fl-comment-label" htmlFor="fl-comment">Comment (optional)</label>
                    <textarea
                      id="fl-comment"
                      className="fl-comment-input"
                      placeholder="Tell us about your experience..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {error && <p className="fl-error">{error}</p>}
                </div>

                <div className="fl-actions">
                  <button
                    className="fl-submit-btn"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                  <button className="fl-dismiss-btn" onClick={handleClose}>
                    Maybe Later
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default FeedbackLauncher
