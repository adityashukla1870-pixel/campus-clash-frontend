import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import "./Tournament.css"

function Tournament() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [userId, setUserId] = useState("")
  const [search, setSearch] = useState("")
  const [gameFilter, setGameFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
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
  }, [location.pathname])

  const gameOptions = [...new Set(tournaments.map(t => t.game).filter(Boolean))]

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

        <div className="tournaments-filters">
          <input
            type="text"
            className="tournaments-search"
            placeholder="🔍 Search tournaments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="tournaments-select"
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
          >
            <option value="all">All Games</option>
            {gameOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
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
                <div className="tournament-card" key={t.id}>
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
                    {t.has_bracket && (
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
