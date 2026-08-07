import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import { FiSearch, FiZap } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { resolveImageUrl } from "../utils/media"
import { SkeletonCardGrid, SkeletonTable, SkeletonText, SkeletonBadge, SkeletonBlock } from "../components/Skeleton"
import "./Tournament.css"

const GAME_ICONS = { BGMI: "🎮", "Free Fire": "🔥", Valorant: "🎯", "Call of Duty Mobile": "🪖" }

function Tournament() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [userId, setUserId] = useState("")
  const [search, setSearch] = useState("")
  const [gameFilter, setGameFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/"); return }
    try {
      const decoded = jwtDecode(token)
      setUserId(decoded.sub)
    } catch {
      navigate("/"); return
    }
    API.get("/tournament/all")
      .then(res => {
        const data = res.data
        setTournaments(Array.isArray(data) ? data : [])
      })
      .finally(() => setLoading(false))
  }, [location.pathname])

  const gameOptions = [...new Set(tournaments.map(t => t.game).filter(Boolean))]

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="tournaments-page">
          <div className="tournaments-header">
            <div className="tournaments-header-left">
              <SkeletonText width="180px" height={28} />
              <SkeletonText width="300px" height={16} />
            </div>
            <SkeletonBadge width={100} />
          </div>
          <SkeletonBlock height={280} style={{ borderRadius: 16, marginBottom: 24 }} />
          <SkeletonTable rows={2} cols={3} style={{ marginBottom: 24 }} />
          <SkeletonCardGrid count={6} />
        </div>
      </>
    )
  }

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.name?.toLowerCase().includes(search.toLowerCase())
    const matchesGame = gameFilter === "all" || t.game === gameFilter
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "open" && t.status === "upcoming" && t.players.length < t.max_players)
      || (statusFilter === "full" && t.players.length >= t.max_players)
      || (statusFilter === "in_progress" && t.status === "in_progress")
      || (statusFilter === "completed" && t.status === "completed")
    return matchesSearch && matchesGame && matchesStatus
  })

  // Feature the biggest live tournament, or failing that the biggest
  // upcoming one — real data only, no placeholder art.
  const featured = [...tournaments]
    .filter(t => t.status === "in_progress")
    .sort((a, b) => (b.prize_pool || 0) - (a.prize_pool || 0))[0]
    || [...tournaments]
      .filter(t => t.status === "upcoming" && t.players.length < t.max_players)
      .sort((a, b) => (b.prize_pool || 0) - (a.prize_pool || 0))[0]

  return (
    <>
      <Navbar />
      <div className="tournaments-page">
        <div className="tournaments-header">
          <div className="tournaments-header-left">
            <h1>🎮 Tournaments</h1>
            <p>Find your next battle — join, compete, win.</p>
          </div>
          <span className="badge badge-purple">{tournaments.length} Active</span>
        </div>

        {featured && (
          <section
            className="featured-banner"
            onClick={() => navigate(`/tournament/${featured.id}`)}
            style={featured.banner_image ? {
              backgroundImage: `linear-gradient(90deg, rgba(8,7,10,0.94) 20%, rgba(8,7,10,0.55) 65%, rgba(8,7,10,0.25) 100%), url(${resolveImageUrl(featured.banner_image)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            <div className="featured-banner-glow" aria-hidden="true" />
            <div className="featured-banner-inner">
              {featured.status === "in_progress" ? (
                <div className="featured-tag live"><span className="dot" /> Live Now</div>
              ) : (
                <div className="featured-tag"><FiZap size={13} /> Featured</div>
              )}
              <h2>{featured.name}</h2>
              <p className="featured-game">{GAME_ICONS[featured.game] || "🎮"} {featured.game}</p>
              <div className="featured-prize-label">Total Prize Pool</div>
              <div className="featured-prize-value">₹{featured.prize_pool?.toLocaleString?.() || featured.prize_pool}</div>
              <button className="featured-cta shimmer-wrap chamfer-sm" onClick={(e) => { e.stopPropagation(); navigate(`/tournament/${featured.id}`) }}>
                {featured.status === "in_progress" ? "View Tournament" : "Register Now"}
              </button>
            </div>
          </section>
        )}

        <div className="tournaments-filters">
          <div className="tournaments-search-wrap">
            <FiSearch className="tournaments-search-icon" />
            <input
              type="text"
              className="tournaments-search"
              placeholder="Search tournaments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="tournaments-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="game-pills">
          <button className={`game-pill${gameFilter === 'all' ? ' active' : ''}`} onClick={() => setGameFilter('all')}>
            All Games
          </button>
          {gameOptions.map((g) => (
            <button
              key={g}
              className={`game-pill${gameFilter === g ? ' active' : ''}`}
              onClick={() => setGameFilter(g)}
            >
              {GAME_ICONS[g] || "🎮"} {g}
            </button>
          ))}
        </div>

        {tournaments.length === 0 ? (
          <div className="tournaments-empty">
            <div className="empty-icon">🎯</div>
            <p>No tournaments available right now. Check back soon!</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="tournaments-empty">
            <div className="empty-icon">🔍</div>
            <p>No tournaments match your filters.</p>
          </div>
        ) : (
          <div className="tournament-list">
            {filteredTournaments.map((t) => {
              const alreadyJoined = t.players?.includes(userId)
              const isFull = t.players.length >= t.max_players
              const fillPct = Math.round((t.players.length / t.max_players) * 100)

              return (
                <div className="tournament-card hover-lift" key={t.id}>
                  {t.banner_image && (
                    <div
                      className="card-banner-image"
                      style={{ backgroundImage: `url(${resolveImageUrl(t.banner_image)})` }}
                    />
                  )}
                  {t.status === 'in_progress' && <div className="card-live-tag">🔴 LIVE</div>}
                  {t.status === 'completed' && <div className="card-live-tag ended">🏁 ENDED</div>}
                  <div className="card-header">
                    <span className="card-game-badge">🎮 {t.game}</span>
                    <span className="badge" style={{background: t.mode === 'squad' ? 'var(--cyan-glow)' : 'var(--purple-glow)', color: t.mode === 'squad' ? 'var(--cyan)' : 'var(--purple-light)', fontSize:11}}>
                      {t.mode === 'squad' ? `👥 Squad (${t.team_size})` : '🧍 Solo'}
                    </span>
                    <span className="badge" style={{background: t.format === 'full' ? '#f59e0b22' : 'var(--cyan-glow)', color: t.format === 'full' ? 'var(--gold)' : 'var(--cyan)', fontSize:11}}>
                      {t.format === 'full' ? '🏅 Multi-Stage' : '⚡ Quick Match'}
                    </span>
                    {alreadyJoined && <span className="badge badge-cyan">Joined</span>}
                    {isFull && !alreadyJoined && <span style={{color:'var(--red)',fontSize:'12px',fontWeight:600}}>FULL</span>}
                  </div>

                  <div className="card-title">{t.name}</div>

                  <div className="card-format-note">
                    {t.format === 'full'
                      ? 'Group stages → playoffs → grand finale, with a live points table.'
                      : 'Single decisive match — winner takes the prize pool.'}
                  </div>

                  <div className="card-stats">
                    <div className="card-stat">
                      <div className="stat-label">Prize Pool</div>
                      <div className="stat-value prize">₹{t.prize_pool}</div>
                    </div>
                    <div className="card-stat">
                      <div className="stat-label">Entry Fee</div>
                      <div className="stat-value">₹{t.entry_fee}</div>
                    </div>
                  </div>

                  <div className="player-bar">
                    <div className="player-bar-top">
                      <span>Players</span>
                      <span>{t.players.length} / {t.max_players}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className={`bar-fill${isFull ? ' full' : ''}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="card-actions">
                    {t.has_bracket && t.format !== 'full' && (
                      <button
                        className="btn-joined"
                        style={{marginRight:8}}
                        onClick={() => navigate(`/tournament/${t.id}/bracket`)}
                      >
                        🏆 Bracket
                      </button>
                    )}
                    <button
                      className={alreadyJoined ? 'btn-joined' : isFull ? 'btn-full' : 'btn-join'}
                      onClick={() => !alreadyJoined && !isFull && navigate(`/tournament/${t.id}`)}
                      disabled={alreadyJoined || isFull}
                    >
                      {alreadyJoined ? '✅ Registered' : isFull ? '🔒 Full' : '⚔️ Join Now'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default Tournament
