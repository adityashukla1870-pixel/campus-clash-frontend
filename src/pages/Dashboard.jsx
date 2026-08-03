import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import SpotlightGlow from "../components/SpotlightGlow"
import API from "../api/axios"
import "./Dashboard.css"

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
            <div className="dash-loading">Loading dashboard...</div>
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

          <div className="dash-welcome glass-panel chamfer">
            <div>
              <span className="uppercase-label">Elite Esports Dashboard</span>
              <h1 className="dash-welcome-title">
                Welcome back, <span>{profile?.name || "Player"}</span>!
              </h1>
              {profile?.college && <p className="dash-welcome-sub">{profile.college}</p>}
            </div>
            <button className="btn-primary shimmer-wrap" onClick={() => navigate("/tournaments")}>
              Join a Tournament
            </button>
          </div>

          <div className="dash-stats-grid">
            <div className="dash-stat-card glass-panel hover-lift">
              <span className="uppercase-label">Matches Joined</span>
              <div className="dash-stat-value">{tournaments.length}</div>
            </div>
            <div className="dash-stat-card glass-panel hover-lift">
              <span className="uppercase-label">Live / Upcoming</span>
              <div className="dash-stat-value">{liveOrUpcoming.length}</div>
            </div>
            <div className="dash-stat-card glass-panel hover-lift">
              <span className="uppercase-label">Completed</span>
              <div className="dash-stat-value">{completed.length}</div>
            </div>
            <div className="dash-stat-card glass-panel hover-lift">
              <span className="uppercase-label">Tournament Wins</span>
              <div className="dash-stat-value gold">{wins.length}</div>
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
                      <span className="dash-battle-status">{statusLabel(t.status)}</span>
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

              {myRankRow ? (
                <div className="dash-rank-card">
                  <div className="dash-rank-number">#{myRankIndex + 1}</div>
                  <div className="dash-rank-details">
                    <div className="dash-rank-wins">{myRankRow.wins} wins</div>
                    <div className="dash-rank-prize">₹{myRankRow.prize_won} won</div>
                  </div>
                </div>
              ) : (
                <div className="dash-empty">
                  <div className="dash-empty-icon">🏆</div>
                  <p>Not ranked yet — win a tournament to enter the leaderboard.</p>
                </div>
              )}

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
