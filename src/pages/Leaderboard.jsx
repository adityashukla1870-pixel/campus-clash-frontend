import { useEffect, useMemo, useState } from "react"
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

  return (
    <>
      <Navbar />
      <main className="lb-page">
        <div className="lb-inner">
          <header className="lb-hero glass-panel chamfer">
            <div className="lb-hero-copy">
              <span className="uppercase-label">Campus Clash rankings</span>
              <h1>Make your <span>mark.</span></h1>
              <p>Verified tournament champions, ranked by titles earned and prize winnings.</p>
            </div>
            <div className="lb-hero-note">
              <FiTrendingUp aria-hidden="true" />
              <span>Updated after every completed final</span>
            </div>
            <div className="lb-summary" aria-label="Leaderboard summary">
              <SummaryStat icon={<FiUsers />} label="Ranked players" value={summary.champions} />
              <SummaryStat icon={<FiAward />} label="Titles claimed" value={summary.titles} />
              <SummaryStat icon={<FiDollarSign />} label="Prizes awarded" value={formatPrize(summary.prizes)} />
            </div>
          </header>

          {loading ? (
            <>
              <SkeletonText width="180px" height={14} style={{ marginBottom: 8 }} />
              <SkeletonText width="300px" height={32} style={{ marginBottom: 24 }} />
              <SkeletonBlock height={140} style={{ borderRadius: 16, marginBottom: 24 }} />
              <SkeletonLeaderboard rows={8} />
            </>
          ) : rows.length === 0 ? (
            <section className="lb-empty glass-panel chamfer" aria-labelledby="empty-title">
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
                    <span className="lb-section-count">Elite standings</span>
                  </div>
                  <div className="lb-podium">
                    <PodiumCard entry={podium[1]} rank={2} tier="silver" />
                    <PodiumCard entry={podium[0]} rank={1} tier="gold" />
                    <PodiumCard entry={podium[2]} rank={3} tier="bronze" />
                  </div>
                </section>
              )}

              {rest.length > 0 && (
                <section className="lb-standings glass-panel chamfer" aria-labelledby="standings-title">
                  <div className="lb-section-heading lb-standings-heading">
                    <div>
                      <span className="uppercase-label">Full rankings</span>
                      <h2 id="standings-title">The chase continues</h2>
                    </div>
                    <span className="lb-section-count">{rest.length} player{rest.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="lb-table" role="table" aria-label="Campus Clash player rankings">
                    <div className="lb-table-head" role="row">
                      <span role="columnheader">Rank</span>
                      <span role="columnheader">Player</span>
                      <span className="lb-col-right" role="columnheader">Titles</span>
                      <span className="lb-col-right" role="columnheader">Prize won</span>
                    </div>
                    {rest.map((row, index) => (
                      <div key={row.user_id} className="lb-table-row" role="row">
                        <span className="lb-rank" role="cell">{rankLabel(index + (hasPodium ? 4 : 1))}</span>
                        <span className="lb-player" role="cell">
                          <span className="lb-avatar" aria-hidden="true">{initials(row.name)}</span>
                          <span className="lb-player-details">
                            <span className="lb-player-name">{row.name}</span>
                            <span className="lb-player-college">{row.college || "Campus Clash player"}</span>
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

function SummaryStat({ icon, label, value }) {
  return (
    <div className="lb-summary-stat">
      <span className="lb-summary-icon" aria-hidden="true">{icon}</span>
      <span>
        <span className="lb-summary-value">{value}</span>
        <span className="lb-summary-label">{label}</span>
      </span>
    </div>
  )
}

function PodiumCard({ entry, rank, tier }) {
  if (!entry) return null

  return (
    <article className={`lb-podium-slot rank-${rank}`}>
      {rank === 1 && <span className="lb-crown" aria-label="Current number one"><FiAward /></span>}
      <div className={`lb-podium-card tier-${tier}`}>
        <span className={`lb-podium-avatar tier-${tier}`} aria-hidden="true">{initials(entry.name)}</span>
        <span className="lb-podium-rank">Rank {rankLabel(rank)}</span>
        <h3 className="lb-podium-name">{entry.name}</h3>
        <p className="lb-podium-college">{entry.college || "Campus Clash player"}</p>
        <div className="lb-podium-divider" />
        <div className="lb-podium-stats">
          <span><FiAward aria-hidden="true" /> {entry.wins} title{entry.wins === 1 ? "" : "s"}</span>
          <strong>{formatPrize(entry.prize_won)}</strong>
        </div>
      </div>
    </article>
  )
}

export default Leaderboard
