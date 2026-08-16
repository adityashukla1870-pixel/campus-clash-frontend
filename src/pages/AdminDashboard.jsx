import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiUsers, FiZap, FiDollarSign, FiClock, FiArrowRight } from "react-icons/fi"
import AdminTopBar from "../components/AdminTopBar"
import SpotlightGlow from "../components/SpotlightGlow"
import API from "../api/axios"
import { SkeletonCardGrid, SkeletonTable, SkeletonCircle, SkeletonText } from "../components/Skeleton"
import "./AdminDashboard.css"

const adminActions = [
  { icon: "💰", label: "Payment Verification", desc: "Review & approve pending payments", path: "/admin/payments", color: "#f59e0b" },
  { icon: "🎮", label: "Release Room", desc: "Share room ID & password with players", path: "/admin/release-room", color: "#f9a825" },
  { icon: "🏆", label: "Create Tournament", desc: "Set up a new esports tournament", path: "/admin/create-tournament", color: "#d4af37" },
  { icon: "🥇", label: "Declare Winner", desc: "Finalize results and announce winner", path: "/admin/winner", color: "#22c55e" },
  { icon: "🏆", label: "Bracket Manager", desc: "Generate brackets & report match results", path: "/admin/bracket", color: "#f2ca50" },
  { icon: "🎯", label: "Manage Stages", desc: "Groups, playoffs & finals for Full Tournaments", path: "/admin/stages", color: "#ffb957" },
  { icon: "🎨", label: "Avatar Library", desc: "Manage avatars available to players", path: "/admin/avatars", color: "#d4af37" },
]

function AdminDashboard() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      API.get("/tournament/all"),
      API.get("/tournament/admin/pending-payments"),
    ]).then(([tRes, pRes]) => {
      setTournaments(Array.isArray(tRes.data) ? tRes.data : [])
      setPending(Array.isArray(pRes.data) ? pRes.data : [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

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
              <div className="admin-dash-header-icon">⚔️</div>
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
                    {action.icon}
                  </div>
                  <h3>{action.label}</h3>
                  <p>{action.desc}</p>
                </div>
              ))}
            </div>

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
