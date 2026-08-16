import { useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiX, FiCheck } from "react-icons/fi"
import { getPublishedAvatars, getSelectedAvatarId } from "../data/avatarRepository"

/**
 * AvatarSelector — modal for players to pick a published avatar.
 *
 * Props:
 *   open          boolean
 *   onClose       () => void
 *   onSelect      (avatarId) => void
 *   currentId     string | null   — currently selected avatar id
 */
export default function AvatarSelector({ open, onClose, onSelect, currentId }) {
  const avatars = open ? getPublishedAvatars() : []
  const selected = currentId || getSelectedAvatarId()

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="avatar-selector-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
        >
          <motion.div
            key="avatar-selector-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 520,
              maxHeight: "85vh",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "20px 20px 0 0",
              padding: "24px 20px 32px",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {/* Drag handle (mobile cue) */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: "var(--border)", margin: "0 auto 20px",
            }} />

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20,
            }}>
              <div>
                <h2 style={{
                  fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800,
                  color: "var(--text-primary)", textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}>Choose Avatar</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                  {avatars.length} avatar{avatars.length !== 1 ? "s" : ""} available
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)",
                  color: "var(--text-secondary)", display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Grid */}
            {avatars.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                <p>No avatars available yet.</p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 12,
              }}>
                {avatars.map((avatar) => {
                  const isSelected = avatar.id === selected
                  return (
                    <motion.button
                      key={avatar.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { onSelect(avatar.id); onClose() }}
                      style={{
                        position: "relative", background: "none", border: "none",
                        padding: 0, cursor: "pointer", borderRadius: 14,
                        overflow: "hidden",
                        outline: isSelected ? "2px solid var(--purple)" : "2px solid transparent",
                        outlineOffset: 2,
                      }}
                    >
                      <div style={{
                        width: "100%", aspectRatio: "1", borderRadius: 12,
                        overflow: "hidden", background: "rgba(0,0,0,0.2)",
                      }}>
                        <img
                          src={avatar.imageUrl}
                          alt={avatar.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      {/* Name */}
                      <div style={{
                        fontSize: 11, fontWeight: 600, color: "var(--text-secondary)",
                        marginTop: 6, whiteSpace: "nowrap", overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {avatar.name}
                      </div>

                      {/* Selected badge */}
                      {isSelected && (
                        <div style={{
                          position: "absolute", top: 6, right: 6,
                          width: 22, height: 22, borderRadius: "50%",
                          background: "var(--purple)", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(212,175,55,0.4)",
                        }}>
                          <FiCheck size={12} style={{ color: "#1a1a00" }} />
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
