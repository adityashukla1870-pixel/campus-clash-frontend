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
    API.get("/tournament/all", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const data = res.data
        setTournaments(Array.isArray(data) ? data : [])
      })
  }, [location.pathname])

  const handleJoin = async (id) => {
    const token = localStorage.getItem("token")
    const res = await API.post(`/tournament/join/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
    const data = res.data
    alert(data.message || data.error)
    if (data.message) {
      setTournaments(prev => prev.map(t => t.id === id ? { ...t, players: [...t.players, userId] } : t))
    }
  }

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

        {tournaments.length === 0 ? (
          <div className="tournaments-empty">
            <div className="empty-icon">🎯</div>
            <p>No tournaments available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="tournament-list">
            {tournaments.map((t) => {
              const alreadyJoined = t.players?.includes(userId)
              const isFull = t.players.length >= t.max_players
              const fillPct = Math.round((t.players.length / t.max_players) * 100)

              return (
                <div className="tournament-card" key={t.id}>
                  <div className="card-header">
                    <span className="card-game-badge">🎮 {t.game}</span>
                    {alreadyJoined && <span className="badge badge-cyan">Joined</span>}
                    {isFull && !alreadyJoined && <span style={{color:'var(--red)',fontSize:'12px',fontWeight:600}}>FULL</span>}
                  </div>

                  <div className="card-title">{t.name}</div>

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
