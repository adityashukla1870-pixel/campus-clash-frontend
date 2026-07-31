import { useEffect, useState } from "react"
import { FiAward, FiTarget, FiZap, FiEdit2 } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import "./Profile.css"

function Profile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: "", college: "", game_uid: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadProfile = () => {
    API.get("/auth/profile").then((res) => {
      setProfile(res.data)
      setForm({
        name: res.data.name || "",
        college: res.data.college || "",
        game_uid: res.data.game_uid || ""
      })
    })
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await API.put("/auth/profile", form)
      setSuccess("Profile updated")
      setEditing(false)
      loadProfile()
    } catch (err) {
      setError(err.response?.data?.error || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="profile-page"><div className="profile-loading">Loading profile...</div></div>
      </>
    )
  }

  const initials = (profile.name || "?").trim().slice(0, 1).toUpperCase()
  const isAdmin = profile.role === "admin"

  return (
    <>
      <Navbar />
      <div className="profile-page">
        {/* Hero */}
        <div className="profile-hero">
          <div className="profile-hero-glow" aria-hidden="true" />
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-ring" />
            <div className="profile-avatar">{initials}</div>
          </div>
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-email">{profile.email}</p>
          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-purple'}`}>
            {isAdmin ? "🛡️ Admin" : "🎮 Player"}
          </span>
        </div>

        {/* Stats */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card hover-lift">
            <FiZap className="profile-stat-icon" />
            <div className="profile-stat-value">{profile.stats?.tournaments_joined ?? 0}</div>
            <div className="profile-stat-label">Tournaments Joined</div>
          </div>
          <div className="profile-stat-card hover-lift">
            <FiAward className="profile-stat-icon gold" />
            <div className="profile-stat-value gold">{profile.stats?.wins ?? 0}</div>
            <div className="profile-stat-label">Wins</div>
          </div>
          <div className="profile-stat-card hover-lift">
            <FiTarget className="profile-stat-icon cyan" />
            <div className="profile-stat-value cyan">₹{profile.stats?.prize_won ?? 0}</div>
            <div className="profile-stat-label">Prize Won</div>
          </div>
        </div>

        {/* Account details */}
        <div className="profile-details-card">
          <div className="profile-details-header">
            <h2>Account Details</h2>
            {!editing && (
              <button className="btn-joined" onClick={() => setEditing(true)}>
                <FiEdit2 size={13} /> Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="profile-details-list">
              <div className="profile-detail-row">
                <span>College</span>
                <span>{profile.college || "—"}</span>
              </div>
              <div className="profile-detail-row">
                <span>Game UID</span>
                <span>{profile.game_uid || "—"}</span>
              </div>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSave}>
              <div className="field-group">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label>College</label>
                <input
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label>Game UID</label>
                <input
                  value={form.game_uid}
                  onChange={(e) => setForm({ ...form, game_uid: e.target.value })}
                />
              </div>

              {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn-primary chamfer-sm" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="nav-btn-ghost"
                  onClick={() => { setEditing(false); setForm({ name: profile.name, college: profile.college, game_uid: profile.game_uid }) }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {success && <p style={{ color: "var(--green)", fontSize: 13, marginTop: 12 }}>{success}</p>}
        </div>
      </div>
    </>
  )
}

export default Profile
