import { useEffect, useRef, useState } from "react"
import { FiX, FiZap, FiAward, FiTarget, FiTrendingUp, FiUser, FiAtSign, FiHome, FiClock, FiStar } from "react-icons/fi"
import API from "../api/axios"
import { resolveAvatarUrl } from "../data/avatarRepository"
import "./PlayerProfileCard.css"

function PlayerProfileCard({ userId, anchorRect, onClose }) {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const cardRef = useRef(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      API.get(`/auth/profile/${userId}`).catch(() => ({ data: null })),
      API.get(`/stats/player/${userId}`).catch(() => ({ data: null })),
    ]).then(([pRes, sRes]) => {
      setProfile(pRes.data)
      setStats(sRes.data)
    }).finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    const handleClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) onClose()
    }
    const handleKey = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [onClose])

  if (!userId) return null

  function getCardPosition() {
    if (!anchorRect) {
      return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10001 }
    }
    const cardW = 600
    const cardH = 300
    let left = anchorRect.right + 12
    let top = anchorRect.top

    if (left + cardW > window.innerWidth - 16) {
      left = anchorRect.left - cardW - 12
    }
    if (left < 16) {
      left = Math.max(16, (window.innerWidth - cardW) / 2)
      top = anchorRect.bottom + 12
    }
    if (top + cardH > window.innerHeight - 16) {
      top = Math.max(16, window.innerHeight - cardH - 16)
    }
    if (top < 16) top = 16

    return { position: "fixed", left, top, zIndex: 10001 }
  }

  const games = stats?.games || {}
  const totalKills = Object.values(games).reduce((s, g) => s + (g.total_kills || 0), 0)
  const totalPlayed = Object.values(games).reduce((s, g) => s + (g.tournaments_played || 0), 0)
  const p = profile?.stats || {}

  const badges = []
  if (p.tournaments_joined >= 1) badges.push({ icon: "⭐", label: "RISING PLAYER", desc: "Just getting started" })
  if (p.tournaments_joined >= 1) badges.push({ icon: "🔥", label: "FIRST STEP", desc: "Joined the platform" })
  if (p.tournaments_joined >= 3) badges.push({ icon: "🎮", label: "TOURNAMENT DEBUT", desc: "3+ tournaments" })
  if (p.wins >= 1) badges.push({ icon: "🎯", label: "IN THE ARENA", desc: "Won a match" })
  if (p.wins >= 3) badges.push({ icon: "🏆", label: "CHAMPION", desc: "Multiple wins" })

  return (
    <div className="ppc-overlay" style={{ position: "fixed", inset: 0, zIndex: 10000 }} onClick={onClose}>
      <div
        ref={cardRef}
        className="ppc-card"
        style={getCardPosition()}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ppc-close" onClick={onClose}><FiX size={16} /></button>

        {loading ? (
          <div className="ppc-loading">
            <div className="ppc-spinner" />
            <span>Loading profile...</span>
          </div>
        ) : !profile ? (
          <div className="ppc-loading">Profile not found</div>
        ) : (
          <>
            <div className="ppc-top">
              <div className="ppc-avatar-section">
                <div className="ppc-avatar">
                  {resolveAvatarUrl(userId)
                    ? <img src={resolveAvatarUrl(userId)} alt="" />
                    : <span>{(profile.name || "?")[0].toUpperCase()}</span>
                  }
                </div>
                <div className="ppc-identity">
                  <h3 className="ppc-name">{profile.name || "Unknown"}</h3>
                  {profile.username && <div className="ppc-username">@{profile.username}</div>}
                  <div className="ppc-tagline">Play. Compete. Conquer.</div>
                  {profile.role === "admin" && <span className="ppc-badge-tag">Staff</span>}
                </div>
              </div>

              <div className="ppc-stat-boxes">
                <div className="ppc-stat-box">
                  <FiZap size={18} className="ppc-stat-icon cyan" />
                  <div className="ppc-stat-val">{p.tournaments_joined || 0}</div>
                  <div className="ppc-stat-label">JOINED</div>
                  <div className="ppc-stat-sub">{profile.joined || "—"}</div>
                </div>
                <div className="ppc-stat-box">
                  <FiAward size={18} className="ppc-stat-icon green" />
                  <div className="ppc-stat-val">{p.wins || 0}</div>
                  <div className="ppc-stat-label">WINS</div>
                  <div className="ppc-stat-sub">{p.wins > 0 ? "Keep going!" : "Keep going!"}</div>
                </div>
                <div className="ppc-stat-box">
                  <FiTarget size={18} className="ppc-stat-icon purple" />
                  <div className="ppc-stat-val">₹{p.prize_won || 0}</div>
                  <div className="ppc-stat-label">PRIZE WON</div>
                  <div className="ppc-stat-sub">Total earned</div>
                </div>
                <div className="ppc-stat-box">
                  <FiTrendingUp size={18} className="ppc-stat-icon green" />
                  <div className="ppc-stat-val">{p.win_rate || 0}%</div>
                  <div className="ppc-stat-label">WIN RATE</div>
                  <div className="ppc-stat-sub">{p.win_rate > 0 ? "Nice!" : "Keep grinding!"}</div>
                </div>
              </div>
            </div>

            <div className="ppc-bottom">
              <div className="ppc-col ppc-player-info">
                <h4><FiUser /> PLAYER INFO</h4>
                <div className="ppc-info-row">
                  <FiUser size={12} />
                  <span className="ppc-info-label">Full Name</span>
                  <span className="ppc-info-val">{profile.name || "—"}</span>
                </div>
                <div className="ppc-info-row">
                  <FiAtSign size={12} />
                  <span className="ppc-info-label">Username</span>
                  <span className="ppc-info-val">{profile.username ? `@${profile.username}` : "—"}</span>
                </div>
                <div className="ppc-info-row">
                  <FiHome size={12} />
                  <span className="ppc-info-label">College</span>
                  <span className="ppc-info-val">{profile.college || "—"}</span>
                </div>
              </div>

              <div className="ppc-col ppc-achievements">
                <h4><FiAward /> ACHIEVEMENTS</h4>
                {badges.length === 0 ? (
                  <div className="ppc-no-badges">No achievements yet</div>
                ) : (
                  <div className="ppc-badge-grid">
                    {badges.slice(0, 4).map((b, i) => (
                      <div key={i} className="ppc-badge-item">
                        <div className="ppc-badge-icon">{b.icon}</div>
                        <div className="ppc-badge-label">{b.label}</div>
                        <div className="ppc-badge-desc">{b.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ppc-col ppc-stats-overview">
                <h4><FiTrendingUp /> STATS OVERVIEW</h4>
                <div className="ppc-info-row">
                  <FiTarget size={12} />
                  <span className="ppc-info-label">Tournaments Played</span>
                  <span className="ppc-info-val">{p.tournaments_joined || 0}</span>
                </div>
                <div className="ppc-info-row">
                  <FiAward size={12} />
                  <span className="ppc-info-label">Top Finishes</span>
                  <span className="ppc-info-val">{p.wins || 0}</span>
                </div>
                <div className="ppc-info-row">
                  <FiZap size={12} />
                  <span className="ppc-info-label">Total Kills</span>
                  <span className="ppc-info-val">{totalKills}</span>
                </div>
                <div className="ppc-info-row">
                  <FiStar size={12} />
                  <span className="ppc-info-label">Community Rating</span>
                  <span className="ppc-info-val">—</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PlayerProfileCard
