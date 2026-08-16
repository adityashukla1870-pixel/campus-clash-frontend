import { useRef, useState } from "react"
import { FiPlus, FiTrash2, FiEye, FiEyeOff, FiImage } from "react-icons/fi"
import AdminTopBar from "../components/AdminTopBar"
import SpotlightGlow from "../components/SpotlightGlow"
import { getAllAvatars, addAvatar, deleteAvatar, togglePublish } from "../data/avatarRepository"
import "./AdminDashboard.css"

function AdminAvatarLibrary() {
  const [avatars, setAvatars] = useState(() => getAllAvatars())
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  const refresh = () => setAvatars(getAllAvatars())

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5 MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleAdd = () => {
    if (!name.trim() || !preview) {
      alert("Please provide a name and select an image.")
      return
    }
    addAvatar({ name: name.trim(), imageUrl: preview })
    setName("")
    setPreview(null)
    setShowForm(false)
    refresh()
  }

  const handleDelete = (id) => {
    if (!window.confirm("Delete this avatar?")) return
    deleteAvatar(id)
    refresh()
  }

  const handleToggle = (id) => {
    togglePublish(id)
    refresh()
  }

  const publishedCount = avatars.filter((a) => a.status === "published").length

  return (
    <div className="admin-dash-page">
      <SpotlightGlow fullpage color="gold" />
      <div className="admin-dash-inner">
        <AdminTopBar />

        <div className="admin-dash-header">
          <div className="admin-dash-header-icon">🎨</div>
          <div>
            <h1>Avatar Library</h1>
            <p>{publishedCount} published · {avatars.length} total</p>
          </div>
        </div>

        {/* Add button / form */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 20px", background: "var(--purple-glow)",
              border: "1px solid var(--border-glow)", borderRadius: 10,
              color: "var(--purple-light)", fontFamily: "var(--font-label)",
              fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 24,
            }}
          >
            <FiPlus size={16} /> Add Avatar
          </button>
        ) : (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 24, marginBottom: 24,
          }}>
            <h3 style={{
              fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700,
              color: "var(--text-primary)", textTransform: "uppercase",
              letterSpacing: "0.02em", marginBottom: 16,
            }}>
              New Avatar
            </h3>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
              {/* Image picker */}
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  width: 96, height: 96, borderRadius: "50%",
                  border: "2px dashed var(--border)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", flexShrink: 0,
                  background: preview ? "transparent" : "rgba(0,0,0,0.2)",
                }}
              >
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <FiImage size={28} style={{ color: "var(--text-muted)" }} />
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

              {/* Fields */}
              <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{
                    fontFamily: "var(--font-label)", fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "var(--text-secondary)",
                  }}>Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cyber Boy"
                    style={{
                      padding: "10px 14px", background: "rgba(0,0,0,0.2)",
                      border: "1px solid var(--border)", borderRadius: 8,
                      color: "var(--text-primary)", fontSize: 14, outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleAdd} style={{
                    padding: "10px 20px", background: "var(--grad-purple)",
                    border: "none", borderRadius: 8, color: "#1a1a00",
                    fontFamily: "var(--font-label)", fontSize: 13, fontWeight: 700,
                    cursor: "pointer",
                  }}>Save</button>
                  <button onClick={() => { setShowForm(false); setPreview(null); setName("") }} style={{
                    padding: "10px 20px", background: "transparent",
                    border: "1px solid var(--border)", borderRadius: 8,
                    color: "var(--text-secondary)", fontSize: 13, cursor: "pointer",
                  }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Avatar grid */}
        {avatars.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-muted)" }}>
            <FiImage size={36} style={{ marginBottom: 12 }} />
            <p>No avatars yet. Add one to get started.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 16,
          }}>
            {avatars.map((avatar) => (
              <div key={avatar.id} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 14, padding: 16, textAlign: "center",
                position: "relative", overflow: "hidden",
              }}>
                {/* Status badge */}
                <span style={{
                  position: "absolute", top: 10, right: 10,
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 6,
                  background: avatar.status === "published" ? "rgba(34,197,94,0.15)" : "rgba(153,144,124,0.15)",
                  color: avatar.status === "published" ? "var(--green)" : "var(--text-muted)",
                }}>
                  {avatar.status === "published" ? "Live" : "Draft"}
                </span>

                <div style={{
                  width: 72, height: 72, borderRadius: "50%", margin: "0 auto 12px",
                  overflow: "hidden", border: "2px solid var(--border-glow)",
                }}>
                  <img src={avatar.imageUrl} alt={avatar.name} style={{
                    width: "100%", height: "100%", objectFit: "cover",
                  }} />
                </div>

                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700,
                  color: "var(--text-primary)", marginBottom: 12,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {avatar.name}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  <button
                    onClick={() => handleToggle(avatar.id)}
                    title={avatar.status === "published" ? "Unpublish" : "Publish"}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)",
                      color: avatar.status === "published" ? "var(--green)" : "var(--text-muted)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {avatar.status === "published" ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(avatar.id)}
                    title="Delete"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)",
                      color: "var(--red)", display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer",
                    }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAvatarLibrary
