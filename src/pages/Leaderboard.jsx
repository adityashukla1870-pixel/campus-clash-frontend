import { useCallback, useEffect, useMemo, useState } from "react"
import { FiAward, FiDollarSign, FiTarget, FiTrendingUp, FiUsers } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { SkeletonLeaderboard, SkeletonText, SkeletonBlock } from "../components/Skeleton"
import "./Leaderboard.css"

function initials(name) {
  return (name || "?").trim().slice(0, 1).toUpperCase()
}

function formatPrize(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function rankLabel(rank) {
  return `${rank < 10 ? "0" : ""}${rank}`
}

function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    API.get("/tournament/leaderboard")
      .then(res => setRows(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const summary = useMemo(() => ({
    champions: rows.length,
    titles: rows.reduce((total, row) => total + (Number(row.wins) || 0), 0),
    prizes: rows.reduce((total, row) => total + (Number(row.prize_won) || 0), 0),
  }), [rows])

  const hasPodium = rows.length >= 3
  const podium = hasPodium ? rows.slice(0, 3) : []
  const rest = hasPodium ? rows.slice(3) : rows

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rest
    const q = searchQuery.toLowerCase()
    return rest.filter(row =>
      row.name?.toLowerCase().includes(q) ||
      row.college?.toLowerCase().includes(q)
    )
  }, [rest, searchQuery])

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  return (
    <>
      <Navbar />
      <main className="lb-page">
        <div className="lb-inner">
          <header className="lb-hero">
            <span className="uppercase-label">Campus Clash rankings</span>
            <h1>Make your <span>mark.</span></h1>
            <p>Verified tournament champions, ranked by titles earned and prize winnings.</p>
          </header>

          <div className="lb-summary">
            <div className="lb-summary-stat">
              <span className="lb-summary-icon" aria-hidden="true"><FiUsers /></span>
              <div>
                <span className="lb-summary-value">{summary.champions}</span>
                <span className="lb-summary-label">Ranked players</span>
              </div>
            </div>
            <div className="lb-summary-stat">
              <span className="lb-summary-icon" aria-hidden="true"><FiAward /></span>
              <div>
                <span className="lb-summary-value">{summary.titles}</span>
                <span className="lb-summary-label">Titles claimed</span>
              </div>
            </div>
            <div className="lb-summary-stat">
              <span className="lb-summary-icon" aria-hidden="true"><FiDollarSign /></span>
              <div>
                <span className="lb-summary-value">{formatPrize(summary.prizes)}</span>
                <span className="lb-summary-label">Prizes awarded</span>
              </div>
            </div>
          </div>

          {loading ? (
            <>
              <SkeletonText width="180px" height={14} style={{ marginBottom: 8 }} />
              <SkeletonText width="300px" height={32} style={{ marginBottom: 24 }} />
              <SkeletonBlock height={140} style={{ borderRadius: 16, marginBottom: 24 }} />
              <SkeletonLeaderboard rows={8} />
            </>
          ) : rows.length === 0 ? (
            <section className="lb-empty" aria-labelledby="empty-title">
              <div className="lb-empty-icon"><FiTarget aria-hidden="true" /></div>
              <span className="uppercase-label">The arena is ready</span>
              <h2 id="empty-title">No champions yet</h2>
              <p>Complete a tournament to become the first player on the board.</p>
            </section>
          ) : (
            <>
              {hasPodium && (
                <section className="lb-featured" aria-labelledby="podium-title">
                  <div className="lb-section-heading">
                    <div>
                      <span className="uppercase-label">Top three</span>
                      <h2 id="podium-title">Champion podium</h2>
                    </div>
                  </div>
                  <div className="lb-podium-container">
                    <div className="lb-podium">
                      <PodiumBlock player={podium[1]} rank={2} />
                      <PodiumBlock player={podium[0]} rank={1} />
                      <PodiumBlock player={podium[2]} rank={3} />
                    </div>
                  </div>
                </section>
              )}

              {filteredRows.length > 0 && (
                <section className="lb-standings" aria-labelledby="standings-title">
                  <div className="lb-standings-header">
                    <div>
                      <span className="uppercase-label">Full rankings</span>
                      <h2 id="standings-title">The chase continues</h2>
                    </div>
                    <div className="lb-standings-controls">
                      <input
                        className="lb-search"
                        type="text"
                        placeholder="Search player..."
                        value={searchQuery}
                        onChange={handleSearch}
                      />
                      <span className="lb-section-count">{filteredRows.length} player{filteredRows.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="lb-table" role="table" aria-label="Campus Clash player rankings">
                    <div className="lb-table-head" role="row">
                      <span role="columnheader">Rank</span>
                      <span role="columnheader">Player</span>
                      <span className="lb-col-right" role="columnheader">Titles</span>
                      <span className="lb-col-right" role="columnheader">Prize won</span>
                    </div>
                    {filteredRows.map((row, index) => (
                      <div key={row.user_id} className="lb-table-row" role="row">
                        <span className="lb-rank" role="cell">{rankLabel(index + (hasPodium ? 4 : 1))}</span>
                        <span className="lb-player" role="cell">
                          <span className="lb-avatar" aria-hidden="true">{initials(row.name)}</span>
                          <span className="lb-player-details">
                            <span className="lb-player-name">{row.name}</span>
                            <span className="lb-player-college">{row.college || "Campus Clash"}</span>
                          </span>
                        </span>
                        <span className="lb-col-right lb-wins" role="cell"><FiAward aria-hidden="true" /> {row.wins}</span>
                        <span className="lb-col-right lb-prize" role="cell">{formatPrize(row.prize_won)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}

function PodiumBlock({ player, rank }) {
  if (!player) return null

  const tierClass = rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze"
  const points = player.wins * 100

  return (
    <div className={`lb-podium-block-wrapper rank-${rank}`}>
      <div className="lb-podium-player-info">
        <div className={`lb-podium-avatar tier-${tierClass}`}>
          <span className="lb-podium-avatar-initials">{initials(player.name)}</span>
          <span className="lb-podium-rank-badge">{rank}</span>
        </div>
        <span className="lb-podium-name">{player.name}</span>
        <div className="lb-podium-points">
          <span className="lb-podium-points-arrow">↑</span>
          <span>{points}</span>
        </div>
      </div>
      <div className={`lb-podium-block tier-${tierClass}`}>
        <div className="lb-podium-block-accent" />
        <div className="lb-podium-block-shadow-left" />
        <div className="lb-podium-block-shadow-right" />
        <span className="lb-podium-watermark">{rank}</span>
      </div>
    </div>
  )
}

export default Leaderboard