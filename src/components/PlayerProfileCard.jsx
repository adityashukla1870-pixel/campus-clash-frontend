import { useEffect, useRef, useState, useMemo } from "react"
import { FiX, FiZap, FiAward, FiTarget, FiTrendingUp, FiUser, FiAtSign, FiHome, FiStar } from "react-icons/fi"
import API from "../api/axios"
import { resolveAvatarUrl, getAvatarById } from "../data/avatarRepository"
import "./PlayerProfileCard.css"

const THEME_PALETTES = {
  "cyber-boy": {
    bg1: "#03045e", bg2: "#061233", bg3: "#0a1628",
    primary: "#0077b6", primaryLight: "#48cae4",
    secondary: "#00b4d8", secondaryLight: "#90e0ef",
    glow: "rgba(0,119,182,0.35)", text: "#e0f2fe",
    textMuted: "#7dd3fc", border: "rgba(0,180,216,0.2)",
  },
  "cyber-girl": {
    bg1: "#1a0f2e", bg2: "#241840", bg3: "#1e1233",
    primary: "#cdb4db", primaryLight: "#ffc8dd",
    secondary: "#ffafcc", secondaryLight: "#ffccd5",
    glow: "rgba(205,180,219,0.3)", text: "#ffc8dd",
    textMuted: "#cdb4db", border: "rgba(255,175,204,0.2)",
  },
  "cyber-light": {
    bg1: "#f5f3ee", bg2: "#ffffff", bg3: "#faf8f5",
    primary: "#d4af37", primaryLight: "#f0d060",
    secondary: "#c98b1e", secondaryLight: "#e8b84a",
    glow: "rgba(212,175,55,0.2)", text: "#1a1510",
    textMuted: "#6b5e3a", border: "rgba(212,175,55,0.25)",
  },
  "default": {
    bg1: "#0d0b14", bg2: "#13111c", bg3: "#0f0d18",
    primary: "#d4af37", primaryLight: "#f0d060",
    secondary: "#f9a825", secondaryLight: "#fdd835",
    glow: "rgba(212,175,55,0.25)", text: "#eae1d4",
    textMuted: "#a09880", border: "rgba(212,175,55,0.2)",
  },
}

function getPalette(themeId) {
  return THEME_PALETTES[themeId] || THEME_PALETTES["default"]
}

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
      API.get(`/stats/player/${userId}/stats`).catch(() => ({ data: null })),
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

  const theme = useMemo(() => {
    if (!profile?.avatarId) return getPalette("default")
    const avatar = getAvatarById(profile.avatarId)
    return getPalette(avatar?.themeId)
  }, [profile])

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

  const gameStats = Array.isArray(stats?.stats) ? stats.stats : []
  const totalKills = gameStats.reduce((s, g) => s + (g.total_kills || 0), 0)
  const matchesPlayed = gameStats.reduce((s, g) => s + (g.tournaments_played || 0), 0)
  const p = profile?.stats || {}

  const badges = []
  if (p.tournaments_joined >= 1) badges.push({ icon: "⭐", label: "RISING PLAYER", desc: "Just getting started" })
  if (p.tournaments_joined >= 1) badges.push({ icon: "🔥", label: "FIRST STEP", desc: "Joined the platform" })
  if (p.tournaments_joined >= 3) badges.push({ icon: "🎮", label: "TOURNAMENT DEBUT", desc: "3+ tournaments" })
  if (p.wins >= 1) badges.push({ icon: "🎯", label: "IN THE ARENA", desc: "Won a match" })
  if (p.wins >= 3) badges.push({ icon: "🏆", label: "CHAMPION", desc: "Multiple wins" })
  if (totalKills >= 10) badges.push({ icon: "💀", label: "SLAYER", desc: "10+ kills" })
  if (totalKills >= 50) badges.push({ icon: "🔥", label: "KILLING SPREE", desc: "50+ kills" })
  if (matchesPlayed >= 5) badges.push({ icon: "⚔️", label: "VETERAN", desc: "5+ matches played" })

  const avatarUrl = resolveAvatarUrl(profile?.avatarId)

  return (
    <div className="ppc-overlay" style={{ position: "fixed", inset: 0, zIndex: 10000 }} onClick={onClose}>
      <div
        ref={cardRef}
        className="ppc-card"
        style={{
          ...getCardPosition(),
          background: `linear-gradient(135deg, ${theme.bg1} 0%, ${theme.bg2} 50%, ${theme.bg3} 100%)`,
          borderColor: theme.border,
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${theme.glow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ppc-close" onClick={onClose}><FiX size={16} /></button>

        {loading ? (
          <div className="ppc-loading">
            <div className="ppc-spinner" style={{ borderTopColor: theme.primary }} />
            <span style={{ color: theme.textMuted }}>Loading profile...</span>
          </div>
        ) : !profile ? (
          <div className="ppc-loading" style={{ color: theme.textMuted }}>Profile not found</div>
        ) : (
          <>
            <div className="ppc-top" style={{ borderBottomColor: theme.border }}>
              <div className="ppc-avatar-section">
                <div className="ppc-avatar" style={{
                  borderColor: theme.primary,
                  boxShadow: `0 0 20px ${theme.glow}`,
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" />
                    : <span>{(profile.name || "?")[0].toUpperCase()}</span>
                  }
                </div>
                <div className="ppc-identity">
                  <h3 className="ppc-name" style={{ color: theme.text }}>{profile.name || "Unknown"}</h3>
                  {profile.username && <div className="ppc-username" style={{ color: theme.primaryLight }}>@{profile.username}</div>}
                  <div className="ppc-tagline" style={{ color: theme.textMuted }}>Play. Compete. Conquer.</div>
                  {profile.role === "admin" && (
                    <span className="ppc-badge-tag" style={{ background: `${theme.primary}33`, color: theme.primaryLight, borderColor: `${theme.primary}50` }}>Staff</span>
                  )}
                </div>
              </div>

              <div className="ppc-stat-boxes">
                <div className="ppc-stat-box" style={{ background: `${theme.primary}10`, borderColor: `${theme.primary}20` }}>
                  <FiZap size={18} style={{ color: theme.secondary }} />
                  <div className="ppc-stat-val" style={{ color: theme.text }}>{p.tournaments_joined || 0}</div>
                  <div className="ppc-stat-label" style={{ color: theme.textMuted }}>JOINED</div>
                  <div className="ppc-stat-sub" style={{ color: theme.textMuted }}>{profile.joined || "—"}</div>
                </div>
                <div className="ppc-stat-box" style={{ background: `${theme.secondary}10`, borderColor: `${theme.secondary}20` }}>
                  <FiAward size={18} style={{ color: theme.secondary }} />
                  <div className="ppc-stat-val" style={{ color: theme.text }}>{p.wins || 0}</div>
                  <div className="ppc-stat-label" style={{ color: theme.textMuted }}>WINS</div>
                  <div className="ppc-stat-sub" style={{ color: theme.textMuted }}>{p.wins > 0 ? "Keep going!" : "Keep going!"}</div>
                </div>
                <div className="ppc-stat-box" style={{ background: `${theme.primary}10`, borderColor: `${theme.primary}20` }}>
                  <FiTarget size={18} style={{ color: theme.primary }} />
                  <div className="ppc-stat-val" style={{ color: theme.text }}>{totalKills}</div>
                  <div className="ppc-stat-label" style={{ color: theme.textMuted }}>TOTAL KILLS</div>
                  <div className="ppc-stat-sub" style={{ color: theme.textMuted }}>Across all games</div>
                </div>
                <div className="ppc-stat-box" style={{ background: `${theme.secondary}10`, borderColor: `${theme.secondary}20` }}>
                  <FiTrendingUp size={18} style={{ color: theme.secondary }} />
                  <div className="ppc-stat-val" style={{ color: theme.text }}>{matchesPlayed}</div>
                  <div className="ppc-stat-label" style={{ color: theme.textMuted }}>MATCHES PLAYED</div>
                  <div className="ppc-stat-sub" style={{ color: theme.textMuted }}>Total matches</div>
                </div>
              </div>
            </div>

            <div className="ppc-bottom">
              <div className="ppc-col ppc-player-info" style={{ borderRightColor: theme.border }}>
                <h4 style={{ color: theme.primaryLight }}><FiUser /> PLAYER INFO</h4>
                <div className="ppc-info-row">
                  <FiUser size={12} style={{ color: theme.textMuted }} />
                  <span className="ppc-info-label" style={{ color: theme.textMuted }}>Full Name</span>
                  <span className="ppc-info-val" style={{ color: theme.text }}>{profile.name || "—"}</span>
                </div>
                <div className="ppc-info-row">
                  <FiAtSign size={12} style={{ color: theme.textMuted }} />
                  <span className="ppc-info-label" style={{ color: theme.textMuted }}>Username</span>
                  <span className="ppc-info-val" style={{ color: theme.text }}>{profile.username ? `@${profile.username}` : "—"}</span>
                </div>
                <div className="ppc-info-row">
                  <FiHome size={12} style={{ color: theme.textMuted }} />
                  <span className="ppc-info-label" style={{ color: theme.textMuted }}>College</span>
                  <span className="ppc-info-val" style={{ color: theme.text }}>{profile.college || "—"}</span>
                </div>
              </div>

              <div className="ppc-col ppc-achievements" style={{ borderRightColor: theme.border }}>
                <h4 style={{ color: theme.primaryLight }}><FiAward /> ACHIEVEMENTS</h4>
                {badges.length === 0 ? (
                  <div className="ppc-no-badges" style={{ color: theme.textMuted }}>No achievements yet</div>
                ) : (
                  <div className="ppc-badge-grid">
                    {badges.slice(0, 4).map((b, i) => (
                      <div key={i} className="ppc-badge-item" style={{ background: `${theme.primary}08`, borderColor: `${theme.primary}15` }}>
                        <div className="ppc-badge-icon">{b.icon}</div>
                        <div className="ppc-badge-label" style={{ color: theme.text }}>{b.label}</div>
                        <div className="ppc-badge-desc" style={{ color: theme.textMuted }}>{b.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ppc-col ppc-stats-overview">
                <h4 style={{ color: theme.primaryLight }}><FiTrendingUp /> STATS OVERVIEW</h4>
                <div className="ppc-info-row">
                  <FiTarget size={12} style={{ color: theme.textMuted }} />
                  <span className="ppc-info-label" style={{ color: theme.textMuted }}>Tournaments Registered</span>
                  <span className="ppc-info-val" style={{ color: theme.text }}>{p.tournaments_joined || 0}</span>
                </div>
                <div className="ppc-info-row">
                  <FiAward size={12} style={{ color: theme.textMuted }} />
                  <span className="ppc-info-label" style={{ color: theme.textMuted }}>Top Finishes</span>
                  <span className="ppc-info-val" style={{ color: theme.text }}>{p.wins || 0}</span>
                </div>
                <div className="ppc-info-row">
                  <FiZap size={12} style={{ color: theme.textMuted }} />
                  <span className="ppc-info-label" style={{ color: theme.textMuted }}>Total Kills</span>
                  <span className="ppc-info-val" style={{ color: theme.text }}>{totalKills}</span>
                </div>
                <div className="ppc-info-row">
                  <FiTrendingUp size={12} style={{ color: theme.textMuted }} />
                  <span className="ppc-info-label" style={{ color: theme.textMuted }}>Matches Played</span>
                  <span className="ppc-info-val" style={{ color: theme.text }}>{matchesPlayed}</span>
                </div>
                <div className="ppc-info-row">
                  <FiStar size={12} style={{ color: theme.textMuted }} />
                  <span className="ppc-info-label" style={{ color: theme.textMuted }}>Win Rate</span>
                  <span className="ppc-info-val" style={{ color: theme.text }}>{p.win_rate || 0}%</span>
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
