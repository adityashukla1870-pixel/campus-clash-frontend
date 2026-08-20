import { useEffect, useRef, useState } from "react"
import { FiTarget, FiAward, FiZap, FiX } from "react-icons/fi"
import API from "../api/axios"
import { resolveAvatarUrl } from "../data/avatarRepository"
import "./PlayerMiniCard.css"

function PlayerMiniCard({ userId, anchorRect, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const cardRef = useRef(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    API.get(`/stats/player/${userId}`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
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

  const pos = anchorRect
    ? { position: "fixed", left: Math.min(anchorRect.left, window.innerWidth - 260), top: anchorRect.bottom + 8, zIndex: 9999 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 9999 }

  const totalKills = data?.games ? Object.values(data.games).reduce((s, g) => s + (g.total_kills || 0), 0) : 0
  const totalWins = data?.tournaments_won || 0
  const games = data?.games || {}

  return (
    <div className="pmc-overlay" style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={onClose}>
      <div
        ref={cardRef}
        className="pmc-card"
        style={pos}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="pmc-close" onClick={onClose}><FiX size={14} /></button>

        {loading ? (
          <div className="pmc-loading">Loading...</div>
        ) : !data ? (
          <div className="pmc-loading">No data</div>
        ) : (
          <>
            <div className="pmc-header">
              <div className="pmc-avatar">
                {resolveAvatarUrl(data.user_id)
                  ? <img src={resolveAvatarUrl(data.user_id)} alt="" />
                  : <span>{(data.name || "?")[0].toUpperCase()}</span>
                }
              </div>
              <div className="pmc-info">
                <div className="pmc-name">{data.name || "Unknown"}</div>
                {data.username && <div className="pmc-username">@{data.username}</div>}
              </div>
            </div>

            <div className="pmc-stats">
              <div className="pmc-stat">
                <FiTarget size={13} />
                <span className="pmc-stat-val">{totalKills}</span>
                <span className="pmc-stat-label">Kills</span>
              </div>
              <div className="pmc-stat">
                <FiAward size={13} />
                <span className="pmc-stat-val">{totalWins}</span>
                <span className="pmc-stat-label">Wins</span>
              </div>
              {Object.keys(games).length > 0 && (
                <div className="pmc-stat">
                  <FiZap size={13} />
                  <span className="pmc-stat-val">{Object.values(games).reduce((s, g) => s + (g.tournaments_played || 0), 0)}</span>
                  <span className="pmc-stat-label">Played</span>
                </div>
              )}
            </div>

            {Object.keys(games).length > 0 && (
              <div className="pmc-games">
                {Object.entries(games).map(([game, stats]) => (
                  <div key={game} className="pmc-game-row">
                    <span className="pmc-game-name">{game.replace("_", " ")}</span>
                    <span className="pmc-game-kills"><FiTarget size={11} /> {stats.total_kills}</span>
                    <span className="pmc-game-wins"><FiAward size={11} /> {stats.tournaments_won}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PlayerMiniCard
