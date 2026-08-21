import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FiAward, FiTarget, FiZap, FiEdit2, FiUser, FiMail, FiBookOpen, FiHash, FiLogOut, FiShield, FiTrendingUp, FiClock, FiCheckCircle, FiLink, FiAtSign, FiMonitor } from "react-icons/fi"
import Navbar from "../components/Navbar"
import AvatarSelector from "../components/AvatarSelector"
import API from "../api/axios"
import { useNavigate } from "react-router-dom"
import { SkeletonProfile, SkeletonCardGrid, SkeletonBlock } from "../components/Skeleton"

import { getSelectedAvatarId, setSelectedAvatarId, resolveAvatarUrl, setPlayerAvatar, getCurrentUserId, getAvatarById, initAvatarLibrary } from "../data/avatarRepository"
import "./Profile.css"

function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [playerStats, setPlayerStats] = useState(null)
  const [tournaments, setTournaments] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: "", college: "", game_uid: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedAvatarId, setSelectedAvatarState] = useState(() => getSelectedAvatarId())

  const loadProfile = () => {
    Promise.all([
      API.get("/auth/profile"),
      API.get("/tournament/my-tournaments"),
      API.get("/stats/player/me").catch(() => ({ data: null })),
    ]).then(([profileRes, tournamentsRes, statsRes]) => {
      setProfile(profileRes.data)
      setTournaments(Array.isArray(tournamentsRes.data) ? tournamentsRes.data : [])
      setPlayerStats(statsRes?.data)
      setForm({
        name: profileRes.data.name || "",
        college: profileRes.data.college || "",
        game_uid: profileRes.data.game_uid || ""
      })
    })
  }

  useEffect(() => {
    initAvatarLibrary()
    loadProfile()
  }, [])

  // Sync current user's selected avatar to the global registry on mount
  useEffect(() => {
    const uid = getCurrentUserId()
    if (uid) {
      const selectedId = getSelectedAvatarId(uid)
      if (selectedId) setPlayerAvatar(uid, selectedId)
    }
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await API.put("/auth/profile", form)
      setSuccess("Profile updated successfully")
      setEditing(false)
      loadProfile()
    } catch (err) {
      setError(err.response?.data?.error || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatarId(avatarId)
    setSelectedAvatarState(avatarId)
    setPlayerAvatar(getCurrentUserId(), avatarId)

    // Notify ThemeProvider so it re-evaluates the active theme
    const avatar = getAvatarById(avatarId)
    window.dispatchEvent(new CustomEvent("avatar-theme-changed", {
      detail: { themeId: avatar?.themeId || null },
    }))
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <SkeletonProfile />
          <SkeletonCardGrid count={3} style={{ marginTop: 24 }} />
          <SkeletonBlock height={200} style={{ borderRadius: 16, marginTop: 24 }} />
        </div>
      </>
    )
  }

  const isAdmin = profile.role === "admin"
  const completed = tournaments.filter(t => t.status === "completed")
  const wins = completed.filter(t => t.is_winner)
  const winRate = completed.length > 0 ? Math.round((wins.length / completed.length) * 100) : 0

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <motion.div variants={container} initial="hidden" animate="show">

          {/* Hero */}
          <motion.div className="profile-hero" variants={item}>
            <div className="profile-hero-glow" aria-hidden="true" />
            <div className="profile-avatar-wrap" onClick={() => setSelectorOpen(true)} style={{ cursor: "pointer" }} title="Change avatar">
              <div className="profile-avatar-ring" />
              <motion.div
                className="profile-avatar"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <img
                  src={resolveAvatarUrl(selectedAvatarId)}
                  alt={profile.name}
                  className="profile-avatar-img"
                />
              </motion.div>
            </div>
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-email">{profile.email}</p>
            <div className="profile-badges">
              <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-player'}`}>
                {isAdmin ? <><FiShield size={12} /> Admin</> : <><FiZap size={12} /> Player</>}
              </span>
              {profile.username && (
                <span className="badge badge-username"><FiAtSign size={11} /> @{profile.username}</span>
              )}
              {profile.auth_provider === "google" && (
                <span className="badge badge-google"><FiLink /> Google</span>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div className="profile-stats-grid" variants={item}>
            <div className="profile-stat-card">
              <FiZap className="profile-stat-icon" />
              <div className="profile-stat-value">{tournaments.length}</div>
              <div className="profile-stat-label">Joined</div>
            </div>
            <div className="profile-stat-card">
              <FiAward className="profile-stat-icon gold" />
              <div className="profile-stat-value gold">{wins.length}</div>
              <div className="profile-stat-label">Wins</div>
            </div>
            <div className="profile-stat-card">
              <FiTarget className="profile-stat-icon cyan" />
              <div className="profile-stat-value cyan">₹{profile.stats?.prize_won ?? 0}</div>
              <div className="profile-stat-label">Prize Won</div>
            </div>
            <div className="profile-stat-card">
              <FiTrendingUp className="profile-stat-icon green" />
              <div className="profile-stat-value green">{winRate}%</div>
              <div className="profile-stat-label">Win Rate</div>
            </div>
          </motion.div>

          {/* Game Stats */}
          {playerStats && Object.keys(playerStats.games || {}).length > 0 && (
            <motion.div className="profile-details-card" variants={item}>
              <div className="profile-details-header">
                <h2><FiMonitor size={16} /> Game Stats</h2>
              </div>
              <div className="profile-game-stats-grid">
                {Object.entries(playerStats.games).map(([game, stats]) => (
                  <div key={game} className="profile-game-stat-card">
                    <div className="profile-game-stat-game">{game}</div>
                    <div className="profile-game-stat-row">
                      <FiTarget size={13} /> <span>{stats.total_kills}</span> kills
                    </div>
                    <div className="profile-game-stat-row">
                      <FiAward size={13} /> <span>{stats.tournaments_won}</span> wins
                    </div>
                    <div className="profile-game-stat-row">
                      <FiZap size={13} /> <span>{stats.tournaments_played}</span> played
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Account Details */}
          <motion.div className="profile-details-card" variants={item}>
            <div className="profile-details-header">
              <h2>Account Details</h2>
              {!editing && (
                <button className="btn-edit" onClick={() => setEditing(true)}>
                  <FiEdit2 size={13} /> Edit
                </button>
              )}
            </div>

            {!editing ? (
              <div className="profile-details-list">
                <div className="profile-detail-row">
                  <span className="detail-label"><FiUser size={14} /> Full Name</span>
                  <span className="detail-value">{profile.name || "—"}</span>
                </div>
                <div className="profile-detail-row">
                  <span className="detail-label"><FiMail size={14} /> Email</span>
                  <span className="detail-value">{profile.email || "—"}</span>
                </div>
                <div className="profile-detail-row">
                  <span className="detail-label"><FiBookOpen size={14} /> College</span>
                  <span className="detail-value">{profile.college || "—"}</span>
                </div>
                <div className="profile-detail-row">
                  <span className="detail-label"><FiHash size={14} /> Game UID</span>
                  <span className="detail-value">{profile.game_uid || "—"}</span>
                </div>
              </div>
            ) : (
              <form className="profile-edit-form" onSubmit={handleSave}>
                <div className="profile-field">
                  <label>Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="profile-field">
                  <label>College</label>
                  <input
                    value={form.college}
                    onChange={(e) => setForm({ ...form, college: e.target.value })}
                    placeholder="Your college"
                  />
                </div>
                <div className="profile-field">
                  <label>Game UID</label>
                  <input
                    value={form.game_uid}
                    onChange={(e) => setForm({ ...form, game_uid: e.target.value })}
                    placeholder="Your in-game ID"
                  />
                </div>

                {error && <p className="profile-msg error">{error}</p>}
                {success && <p className="profile-msg success">{success}</p>}

                <div className="profile-edit-actions">
                  <button type="submit" className="btn-primary chamfer-sm" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => { setEditing(false); setForm({ name: profile.name, college: profile.college, game_uid: profile.game_uid }); setError(""); setSuccess("") }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div className="profile-activity-card" variants={item}>
            <div className="profile-details-header">
              <h2>Recent Activity</h2>
              <span className="profile-activity-count">{tournaments.length} total</span>
            </div>
            {tournaments.length === 0 ? (
              <div className="profile-empty">
                <FiClock size={32} />
                <p>No tournaments yet. Join one to get started!</p>
                <button className="btn-primary chamfer-sm" onClick={() => navigate("/tournaments")}>Browse Tournaments</button>
              </div>
            ) : (
              <div className="profile-activity-list">
                {tournaments.slice(0, 5).map((t, i) => (
                  <motion.div
                    key={t.id || i}
                    className="profile-activity-row"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="activity-info">
                      <span className="activity-name">{t.name}</span>
                      <span className="activity-meta">{t.game} · {t.team_name || "Solo"}</span>
                    </div>
                    <span className={`activity-status ${t.status === "completed" ? (t.is_winner ? "status-win" : "status-done") : "status-live"}`}>
                      {t.status === "completed" ? (t.is_winner ? <><FiAward size={12} /> Won</> : <><FiCheckCircle size={12} /> Done</>) : <><FiZap size={12} /> Live</>}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div className="profile-actions-card" variants={item}>
            <h2>Quick Actions</h2>
            <div className="profile-actions-grid">
              <button className="profile-action-btn" onClick={() => navigate("/tournaments")}>
                <FiZap size={18} />
                <span>Join Tournament</span>
              </button>
              <button className="profile-action-btn" onClick={() => navigate("/leaderboard")}>
                <FiTrendingUp size={18} />
                <span>Leaderboard</span>
              </button>
              <button className="profile-action-btn" onClick={() => navigate("/community")}>
                <FiUser size={18} />
                <span>Community</span>
              </button>
              <button className="profile-action-btn logout-btn" onClick={handleLogout}>
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>

        </motion.div>
      </div>

      <AvatarSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleAvatarSelect}
        currentId={selectedAvatarId}
      />
    </>
  )
}

export default Profile