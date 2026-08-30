import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiUsers, FiZap, FiDollarSign, FiClock, FiArrowRight, FiMonitor, FiAward, FiTarget, FiAperture, FiCrosshair, FiUserCheck, FiStar } from "react-icons/fi"
import AdminTopBar from "../components/AdminTopBar"
import SpotlightGlow from "../components/SpotlightGlow"
import API from "../api/axios"
import { SkeletonCardGrid, SkeletonTable, SkeletonCircle, SkeletonText } from "../components/Skeleton"
import "./AdminDashboard.css"

const adminActions = [
  { Icon: FiDollarSign, label: "Payment Verification", desc: "Review & approve pending payments", path: "/admin/payments", color: "#f59e0b" },
  { Icon: FiMonitor, label: "Release Room", desc: "Share room ID & password with players", path: "/admin/release-room", color: "#f9a825" },
  { Icon: FiAward, label: "Create Tournament", desc: "Set up a new esports tournament", path: "/admin/create-tournament", color: "#d4af37" },
  { Icon: FiAward, label: "Declare Winner", desc: "Finalize results and announce winner", path: "/admin/winner", color: "#22c55e" },
  { Icon: FiAward, label: "Bracket Manager", desc: "Generate brackets & report match results", path: "/admin/bracket", color: "#f2ca50" },
  { Icon: FiTarget, label: "Manage Stages", desc: "Groups, playoffs & finals for Full Tournaments", path: "/admin/stages", color: "#ffb957" },
  { Icon: FiTarget, label: "Cross-Pod Round Robin", desc: "Pair groups head-to-head in combined lobbies", path: "/admin/cross-pod", color: "#06b6d4" },
  { Icon: FiAperture, label: "Avatar Library", desc: "Manage avatars available to players", path: "/admin/avatars", color: "#d4af37" },
  { Icon: FiUserCheck, label: "User Management", desc: "Search users & reset passwords", path: "/admin/users", color: "#06b6d4" },
  { Icon: FiStar, label: "Player Feedback", desc: "Review & approve player feedback", path: "/admin/feedback", color: "#f59e0b" },
]

function AdminDashboard() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [fixingStats, setFixingStats] = useState(false)

  useEffect(() => {
    Promise.all([
      API.get("/tournament/all"),
      API.get("/tournament/admin/pending-payments"),
    ]).then(([tRes, pRes]) => {
      setTournaments(Array.isArray(tRes.data) ? tRes.data : [])
      setPending(Array.isArray(pRes.data) ? pRes.data : [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const fixKillStats = async () => {
    if (!confirm("This will recalculate ALL player kills from match results. Continue?")) return
    setFixingStats(true)
    try {
      const res = await API.post("/stages/admin/fix-kill-stats")
      alert(res.data?.message || "Done! Leaderboard fixed.")
    } catch (err) {
      alert(err.response?.data?.error || "Failed")
    } finally {
      setFixingStats(false)
    }
  }

  const liveCount = tournaments.filter(t => t.status === "in_progress").length
  const totalPlayers = tournaments.reduce((sum, t) => sum + (t.players?.length || 0), 0)
  const totalPrizePool = tournaments.reduce((sum, t) => sum + (t.prize_pool || 0), 0)

  const statCards = [
    { icon: FiUsers, label: "Total Players", value: totalPlayers, note: `Across ${tournaments.length} tournaments`, color: "purple" },
    { icon: FiZap, label: "Live Events", value: liveCount, note: liveCount > 0 ? "Happening right now" : "Nothing live currently", color: "cyan" },
    { icon: FiDollarSign, label: "Total Prize Pool", value: `₹${totalPrizePool.toLocaleString()}`, note: "Across all tournaments", color: "gold" },
    { icon: FiClock, label: "Pending Verification", value: pending.length, note: "Awaiting admin action", color: "red", pulse: pending.length > 0 },
  ]

  return (
    <div className="admin-dash-page">
      <SpotlightGlow fullpage color="gold" />
      <div className="admin-dash-inner">
        <AdminTopBar showBack={false} />

        {loading ? (
          <>
            <div className="admin-dash-header" style={{ marginBottom: 24 }}>
              <SkeletonCircle size={48} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 16 }}>
                <SkeletonText width="180px" height={28} />
                <SkeletonText width="200px" height={16} />
              </div>
            </div>
            <SkeletonCardGrid count={4} style={{ marginBottom: 32 }} />
            <SkeletonText width="150px" height={14} style={{ marginBottom: 8 }} />
            <SkeletonText width="280px" height={24} style={{ marginBottom: 24 }} />
            <SkeletonCardGrid count={6} />
          </>
        ) : (
          <>
            <div className="admin-dash-header">
              <div className="admin-dash-header-icon"><FiCrosshair /></div>
              <div>
                <h1>Admin Dashboard</h1>
                <p>Campus Clash — Control Panel</p>
              </div>
            </div>

            {/* Stats */}
            <div className="admin-stats-grid">
              {statCards.map((s) => (
                <div key={s.label} className={`admin-stat-card accent-${s.color}`}>
                  <div className="admin-stat-top">
                    <span className="admin-stat-label">{s.label}</span>
                    {s.pulse ? <span className="admin-stat-pulse-dot" /> : <s.icon size={16} className="admin-stat-icon" />}
                  </div>
                  <div className="admin-stat-value">{s.value}</div>
                  <div className="admin-stat-note">{s.note}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <h2 className="admin-section-title">Command Center</h2>
            <div className="admin-actions-grid">
              {adminActions.map((action) => (
                <div
                  key={action.path}
                  className="admin-action-card"
                  onClick={() => navigate(action.path)}
                  style={{ '--accent': action.color }}
                >
                  <div className="admin-action-icon" style={{ background: action.color + '22', border: `1px solid ${action.color}44` }}>
                    <action.Icon size={24} />
                  </div>
                  <h3>{action.label}</h3>
                  <p>{action.desc}</p>
                </div>
              ))}
            </div>

            {/* Fix Kill Stats button */}
            <button
              onClick={fixKillStats}
              disabled={fixingStats}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {fixingStats ? "Fixing..." : "Recalculate All Player Kills (Leaderboard Fix)"}
            </button>

            {/* Pending payments preview */}
            {pending.length > 0 && (
              <>
                <div className="admin-section-title-row">
                  <h2 className="admin-section-title">Awaiting Verification</h2>
                  <span className="admin-view-all" onClick={() => navigate("/admin/payments")}>
                    View All <FiArrowRight size={13} />
                  </span>
                </div>
                <div className="admin-pending-list">
                  {pending.slice(0, 5).map((p) => (
                    <div key={p._id} className="admin-pending-row" onClick={() => navigate("/admin/payments")}>
                      <div>
                        <div className="apr-name">{p.player_name}</div>
                        <div className="apr-tournament">{p.tournament_name}</div>
                      </div>
                      <div className="apr-fee">₹{p.entry_fee}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
