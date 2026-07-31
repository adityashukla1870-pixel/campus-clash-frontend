import { useEffect, useState } from "react"
import { FiAward } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import "./Leaderboard.css"

function initials(name) {
  return (name || "?").trim().slice(0, 1).toUpperCase()
}

function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get("/tournament/leaderboard")
      .then(res => setRows(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Only build the fancy 3-column podium once there are actually 3+ ranked
  // players — otherwise just fall through to the plain list below.
  const hasPodium = rows.length >= 3
  const podium = hasPodium ? rows.slice(0, 3) : []
  const rest = hasPodium ? rows.slice(3) : rows

  return (
    <>
      <Navbar />
      <div className="lb-page">
        <div className="lb-inner">
          <div className="lb-header">
            <h1>🏆 Campus Rankings</h1>
            <p>Top players ranked by tournament wins.</p>
          </div>

          {loading ? (
            <div className="lb-loading">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="lb-empty">
              <div className="lb-empty-icon">🎯</div>
              <p>No completed tournaments yet — be the first champion!</p>
            </div>
          ) : (
            <>
              {hasPodium && (
                <div className="lb-podium">
                  {/* Rank 2 */}
                  <PodiumCard entry={podium[1]} rank={2} tier="silver" />
                  {/* Rank 1 */}
                  <PodiumCard entry={podium[0]} rank={1} tier="gold" />
                  {/* Rank 3 */}
                  <PodiumCard entry={podium[2]} rank={3} tier="bronze" />
                </div>
              )}

              {rest.length > 0 && (
                <div className="lb-table">
                  <div className="lb-table-head">
                    <span>Rank</span>
                    <span>Player</span>
                    <span className="lb-col-right">Wins</span>
                    <span className="lb-col-right">Prize Won</span>
                  </div>
                  {rest.map((r, i) => (
                    <div key={r.user_id} className="lb-table-row">
                      <span className="lb-rank">#{i + 4}</span>
                      <span className="lb-player">
                        <span className="lb-avatar">{initials(r.name)}</span>
                        <span>
                          <span className="lb-player-name">{r.name}</span>
                          {r.college && <span className="lb-player-college">{r.college}</span>}
                        </span>
                      </span>
                      <span className="lb-col-right lb-wins"><FiAward size={13} /> {r.wins}</span>
                      <span className="lb-col-right lb-prize">₹{r.prize_won}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function PodiumCard({ entry, rank, tier }) {
  if (!entry) return <div className="lb-podium-slot empty" />
  return (
    <div className={`lb-podium-slot rank-${rank}`}>
      {rank === 1 && <div className="lb-crown">👑</div>}
      <div className={`lb-podium-card tier-${tier}`}>
        <div className={`lb-podium-avatar tier-${tier}`}>{initials(entry.name)}</div>
        <div className="lb-podium-rank">#{rank}</div>
        <h3 className="lb-podium-name">{entry.name}</h3>
        {entry.college && <p className="lb-podium-college">{entry.college}</p>}
        <div className={`lb-podium-pts tier-${tier}`}>{entry.wins} WIN{entry.wins === 1 ? '' : 'S'}</div>
        <div className="lb-podium-prize">₹{entry.prize_won} won</div>
      </div>
    </div>
  )
}

export default Leaderboard
