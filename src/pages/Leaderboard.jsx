import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { FiAward, FiDollarSign, FiTarget, FiTrendingUp, FiUsers } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { SkeletonLeaderboard, SkeletonText, SkeletonBlock } from "../components/Skeleton"
import { getSelectedAvatarId, resolveAvatarUrl, getCurrentUserId, getPlayerAvatar } from "../data/avatarRepository"
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

function playerAvatarUrl(player) {
  if (!player?.user_id) return null

  // Current user: prefer the live per-user selection
  const myId = getCurrentUserId()
  if (myId && player.user_id === myId) {
    const selectedId = getSelectedAvatarId(myId)
    if (selectedId) return resolveAvatarUrl(selectedId)
  }

  // Any player: look up from the global player→avatarId registry
  const avatarId = getPlayerAvatar(player.user_id)
  if (avatarId) return resolveAvatarUrl(avatarId)

  return null
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
          <motion.header
            className="lb-hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="uppercase-label">Campus Clash rankings</span>
            <h1>Make your <span>mark.</span></h1>
            <p>Verified tournament champions, ranked by titles earned and prize winnings.</p>
          </motion.header>

          <motion.div
            className="lb-summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
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
          </motion.div>

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
                  <motion.div
                    className="lb-section-heading"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div>
                      <span className="uppercase-label">Top three</span>
                      <h2 id="podium-title">Champion podium</h2>
                    </div>
                  </motion.div>
                  <motion.div
                    className="lb-podium-container"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="lb-podium">
                      <PodiumBlock player={podium[1]} rank={2} delay={0.6} />
                      <PodiumBlock player={podium[0]} rank={1} delay={0.3} />
                      <PodiumBlock player={podium[2]} rank={3} delay={0.8} />
                    </div>
                  </motion.div>
                </section>
              )}

              {filteredRows.length > 0 && (
                <motion.section
                  className="lb-standings"
                  aria-labelledby="standings-title"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
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
                      <motion.div
                        key={row.user_id}
                        className="lb-table-row"
                        role="row"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.1 + index * 0.05 }}
                      >
                        <span className="lb-rank" role="cell">{rankLabel(index + (hasPodium ? 4 : 1))}</span>
                        <span className="lb-player" role="cell">
                          {playerAvatarUrl(row) ? (
                            <span className="lb-avatar" aria-hidden="true" style={{ padding: 0, overflow: "hidden" }}>
                              <img src={playerAvatarUrl(row)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </span>
                          ) : (
                            <span className="lb-avatar" aria-hidden="true">{initials(row.name)}</span>
                          )}
                          <span className="lb-player-details">
                            <span className="lb-player-name">{row.name}</span>
                            <span className="lb-player-college">{row.college || "Campus Clash"}</span>
                          </span>
                        </span>
                        <span className="lb-col-right lb-wins" role="cell"><FiAward aria-hidden="true" /> {row.wins}</span>
                        <span className="lb-col-right lb-prize" role="cell">{formatPrize(row.prize_won)}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}

function PodiumBlock({ player, rank, delay = 0 }) {
  if (!player) return null

  const tierClass = rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze"
  const points = player.wins * 100
  const blockHeight = rank === 1 ? 180 : rank === 2 ? 120 : 90

  return (
    <div className={`lb-podium-block-wrapper rank-${rank}`}>
      <motion.div
        className="lb-podium-player-info"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className={`lb-podium-avatar tier-${tierClass}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: delay + 0.2,
          }}
          whileHover={{ scale: 1.1 }}
        >
          {playerAvatarUrl(player) ? (
            <span className="lb-podium-avatar-initials" style={{ padding: 0 }}>
              <img src={playerAvatarUrl(player)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            </span>
          ) : (
            <span className="lb-podium-avatar-initials">{initials(player.name)}</span>
          )}
          <motion.span
            className="lb-podium-rank-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: delay + 0.5 }}
          >
            {rank}
          </motion.span>
        </motion.div>
        <span className="lb-podium-name">{player.name}</span>
        <motion.div
          className="lb-podium-points"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: delay + 0.6 }}
        >
          <span className="lb-podium-points-arrow">↑</span>
          <span>{points}</span>
        </motion.div>
      </motion.div>
      <motion.div
        className={`lb-podium-block tier-${tierClass}`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: blockHeight, opacity: 1 }}
        transition={{
          duration: 0.7,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        whileHover={{
          boxShadow: rank === 1
            ? "0 -3px 0 0 rgba(212,175,55,0.5), inset 0 1px 0 rgba(212,175,55,0.3)"
            : rank === 2
            ? "0 -3px 0 0 rgba(203,213,225,0.5), inset 0 1px 0 rgba(203,213,225,0.3)"
            : "0 -3px 0 0 rgba(205,127,50,0.5), inset 0 1px 0 rgba(205,127,50,0.3)",
        }}
      >
        <div className="lb-podium-block-accent" />
        <div className="lb-podium-block-shadow-left" />
        <div className="lb-podium-block-shadow-right" />
        <motion.span
          className="lb-podium-watermark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: delay + 0.3 }}
        >
          {rank}
        </motion.span>
      </motion.div>
    </div>
  )
}

export default Leaderboard