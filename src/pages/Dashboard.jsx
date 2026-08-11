import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaShieldAlt,
  FaWallet,
  FaUsers,
  FaGamepad,
  FaTrophy,
  FaFire,
  FaCheckCircle,
  FaChartLine,
} from "react-icons/fa"
import Navbar from "../components/Navbar"
import SpotlightGlow from "../components/SpotlightGlow"
import API from "../api/axios"
import { SkeletonCardGrid, SkeletonProfile, SkeletonLeaderboard, SkeletonCard, SkeletonButton } from "../components/Skeleton"
import "./Dashboard.css"

const DASH_OVERVIEW = [
  {
    icon: <FaShieldAlt />,
    title: "Verified Tournaments",
    desc: "Every match is supervised, with fair play checks and fast dispute handling.",
  },
  {
    icon: <FaWallet />,
    title: "Instant Rewards",
    desc: "Prize money is credited quickly when you win, so your earnings stay in motion.",
  },
  {
    icon: <FaUsers />,
    title: "Campus Community",
    desc: "Join players from your college and compete against rival teams across India.",
  },
]

const DASH_HOW_IT_WORKS = [
  {
    number: "01",
    title: "Find a Match",
    desc: "Browse live and upcoming tournaments tailored to your game and skill level.",
  },
  {
    number: "02",
    title: "Reserve Your Spot",
    desc: "Register for the bracket and lock in your room ID before the start time.",
  },
  {
    number: "03",
    title: "Compete Live",
    desc: "Play the match, track your score, and compare results through the dashboard.",
  },
  {
    number: "04",
    title: "Claim Rewards",
    desc: "Win tournaments to level up your rank and collect cash prizes instantly.",
  },
]

function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [tournaments, setTournaments] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      API.get("/auth/profile"),
      API.get("/tournament/my-tournaments"),
      API.get("/tournament/leaderboard"),
    ])
      .then(([profileRes, myTournamentsRes, leaderboardRes]) => {
        setProfile(profileRes.data)
        setTournaments(Array.isArray(myTournamentsRes.data) ? myTournamentsRes.data : [])
        setLeaderboard(Array.isArray(leaderboardRes.data) ? leaderboardRes.data : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const liveOrUpcoming = tournaments.filter(t => t.status === "approved")
  const completed = tournaments.filter(t => t.status === "completed")
  const wins = completed.filter(t => t.is_winner)
  const winRate = completed.length ? Math.round((wins.length / completed.length) * 100) : null
  const isNewPlayer = tournaments.length === 0

  // Best-effort match — leaderboard rows don't carry a shared user id on the
  // frontend, so we match on name+college like the rest of the app already
  // implicitly assumes (names are unique per college here).
  const myRankIndex = profile
    ? leaderboard.findIndex(r => r.name === profile.name && (!r.college || r.college === profile.college))
    : -1
  const myRankRow = myRankIndex >= 0 ? leaderboard[myRankIndex] : null

  const statusLabel = (status) => {
    if (status === "completed") return "Completed"
    if (status === "approved") return "Live / Upcoming"
    return "Pending Approval"
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-page">
          <div className="dashboard-inner">
            <SkeletonProfile style={{ marginBottom: 24 }} />
            <div className="dash-stats-grid" style={{ marginBottom: 24 }}>
              <SkeletonCard height={92} />
              <SkeletonCard height={92} />
              <SkeletonCard height={92} />
              <SkeletonCard height={92} />
            </div>
            <div className="dash-two-col" style={{ gap: 20 }}>
              <SkeletonCard height={300} />
              <SkeletonCard height={300} />
            </div>
            <div className="dash-quicklinks" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <SkeletonButton width={160} height={48} />
              <SkeletonButton width={160} height={48} />
              <SkeletonButton width={160} height={48} />
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <SpotlightGlow fullpage color="gold" />
        <div className="dashboard-inner">

          {/* Hero */}
          <div className="dash-welcome glass-panel chamfer">
            <div className="dash-welcome-main">
              <span className="uppercase-label">Elite Esports Dashboard</span>
              <h1 className="dash-welcome-title">
                Welcome back, <span>{profile?.name || "Player"}</span>
              </h1>
              {profile?.college && <p className="dash-welcome-sub">{profile.college}</p>}

              <div className="dash-chip-row">
                {myRankRow && (
                  <span className="dash-chip dash-chip-gold">
                    <FaTrophy /> Rank #{myRankIndex + 1} on leaderboard
                  </span>
                )}
                {winRate !== null && (
                  <span className="dash-chip dash-chip-cyan">
                    <FaChartLine /> {winRate}% win rate
                  </span>
                )}
                {liveOrUpcoming.length > 0 && (
                  <span className="dash-chip dash-chip-live">
                    <span className="dash-live-dot" /> {liveOrUpcoming.length} match{liveOrUpcoming.length > 1 ? "es" : ""} up next
                  </span>
                )}
              </div>
            </div>
            <button className="btn-primary shimmer-wrap" onClick={() => navigate("/tournaments")}>
              Join a Tournament
            </button>
          </div>

          {/* Stat cards */}
          <div className="dash-stats-grid">
            <div className="dash-stat-card glass-panel hover-lift">
              <div className="dash-stat-top">
                <span className="uppercase-label">Matches Joined</span>
                <span className="dash-stat-icon"><FaGamepad /></span>
              </div>
              <div className="dash-stat-value">{tournaments.length}</div>
              <span className="dash-stat-note">All-time entries</span>
            </div>

            <div className="dash-stat-card glass-panel hover-lift">
              <div className="dash-stat-top">
                <span className="uppercase-label">Live / Upcoming</span>
                <span className="dash-stat-icon dash-stat-icon-cyan"><FaFire /></span>
              </div>
              <div className="dash-stat-value">{liveOrUpcoming.length}</div>
              <span className="dash-stat-note">Ready to check in</span>
            </div>

            <div className="dash-stat-card glass-panel hover-lift">
              <div className="dash-stat-top">
                <span className="uppercase-label">Completed</span>
                <span className="dash-stat-icon"><FaCheckCircle /></span>
              </div>
              <div className="dash-stat-value">{completed.length}</div>
              <span className="dash-stat-note">Matches played</span>
            </div>

            <div className="dash-stat-card glass-panel hover-lift">
              <div className="dash-stat-top">
                <span className="uppercase-label">Tournament Wins</span>
                <span className="dash-stat-icon dash-stat-icon-gold"><FaTrophy /></span>
              </div>
              <div className="dash-stat-value gold">{wins.length}</div>
              <span className="dash-stat-note">{winRate !== null ? `${winRate}% win rate` : "Play your first match"}</span>
            </div>
          </div>

          <div className="dash-two-col">
            <div className="dash-section glass-panel">
              <div className="dash-section-head">
                <h2>Next Battles</h2>
                <span className="dash-view-all" onClick={() => navigate("/my-tournaments")}>View All</span>
              </div>

              {liveOrUpcoming.length === 0 ? (
                <div className="dash-empty">
                  <div className="dash-empty-icon">🎯</div>
                  <p>No live or upcoming matches. Go find a battle!</p>
                  <button className="btn-primary" onClick={() => navigate("/tournaments")}>Browse Tournaments</button>
                </div>
              ) : (
                <div className="dash-battle-list">
                  {liveOrUpcoming.slice(0, 3).map(t => (
                    <div key={t.id} className="dash-battle-card chamfer-sm" onClick={() => navigate(`/room/${t.id}`)}>
                      <div>
                        <div className="dash-battle-name">{t.name}</div>
                        <div className="dash-battle-meta">
                          {t.game}{t.team_name ? ` · ${t.team_name}` : ""}
                        </div>
                      </div>
                      <span className="dash-battle-status">
                        <span className="dash-live-dot" />
                        {statusLabel(t.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dash-section glass-panel">
              <div className="dash-section-head">
                <h2>Your Standing</h2>
                <span className="dash-view-all" onClick={() => navigate("/leaderboard")}>Leaderboard</span>
              </div>

              <div className="dash-standing-top">
                <div className="dash-winrate-ring" style={{ "--pct": winRate ?? 0 }}>
                  <div className="dash-winrate-inner">
                    <div className="dash-winrate-value">{winRate !== null ? `${winRate}%` : "—"}</div>
                    <div className="dash-winrate-label">Win Rate</div>
                  </div>
                </div>

                {myRankRow ? (
                  <div className="dash-rank-card">
                    <div className="dash-rank-number">#{myRankIndex + 1}</div>
                    <div className="dash-rank-details">
                      <div className="dash-rank-wins">{myRankRow.wins} wins</div>
                      <div className="dash-rank-prize">₹{myRankRow.prize_won} won</div>
                    </div>
                  </div>
                ) : (
                  <div className="dash-rank-card dash-rank-card-empty">
                    <div className="dash-rank-details">
                      <div className="dash-rank-wins">Not ranked yet</div>
                      <div className="dash-rank-prize">Win a tournament to enter the leaderboard</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="dash-recent-activity">
                <span className="uppercase-label">Recent Results</span>
                {completed.length === 0 ? (
                  <p className="dash-empty-sub">No completed matches yet.</p>
                ) : (
                  completed.slice(0, 3).map(t => (
                    <div key={t.id} className="dash-activity-row">
                      <span>{t.name}</span>
                      <span className={t.is_winner ? "dash-activity-win" : "dash-activity-loss"}>
                        {t.is_winner ? "Won 🏆" : "Finished"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {isNewPlayer ? (
            <>
              <div className="dash-info-panel glass-panel">
                <div className="dash-section-head">
                  <div>
                    <h2>Platform Snapshot</h2>
                    <p className="dash-info-copy">A quick look at what Campus Clash does for your competitive journey.</p>
                  </div>
                </div>
                <div className="dash-info-grid">
                  {DASH_OVERVIEW.map((item, index) => (
                    <div key={index} className="dash-info-card chamfer-sm hover-lift">
                      <div className="dash-info-icon">{item.icon}</div>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dash-how-section glass-panel">
                <div className="dash-section-head">
                  <div>
                    <h2>How it works</h2>
                    <p className="dash-info-copy">Use your dashboard to track every step from signup to victory.</p>
                  </div>
                </div>
                <div className="dash-how-grid">
                  {DASH_HOW_IT_WORKS.map((step) => (
                    <div key={step.number} className="dash-how-step chamfer-sm hover-lift">
                      <span className="dash-how-step-number">{step.number}</span>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="dash-highlights glass-panel">
              <div className="dash-section-head">
                <h2>Why Campus Clash</h2>
              </div>
              <div className="dash-highlights-grid">
                {DASH_OVERVIEW.map((item, index) => (
                  <div key={index} className="dash-highlight-pill hover-lift">
                    <span className="dash-highlight-icon">{item.icon}</span>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dash-quicklinks">
            <div className="dash-quicklink chamfer-sm hover-lift" onClick={() => navigate("/tournaments")}>Browse Tournaments</div>
            <div className="dash-quicklink chamfer-sm hover-lift" onClick={() => navigate("/community")}>Community</div>
            <div className="dash-quicklink chamfer-sm hover-lift" onClick={() => navigate("/profile")}>Edit Profile</div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Dashboard
