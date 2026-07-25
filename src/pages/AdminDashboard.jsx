import { useNavigate } from "react-router-dom"
import AdminTopBar from "../components/AdminTopBar"

const adminActions = [
  { icon: "💰", label: "Payment Verification", desc: "Review & approve pending payments", path: "/admin/payments", color: "#f59e0b" },
  { icon: "🎮", label: "Release Room", desc: "Share room ID & password with players", path: "/admin/release-room", color: "#06b6d4" },
  { icon: "🏆", label: "Create Tournament", desc: "Set up a new esports tournament", path: "/admin/create-tournament", color: "#7c3aed" },
  { icon: "🥇", label: "Declare Winner", desc: "Finalize results and announce winner", path: "/admin/winner", color: "#22c55e" },
  { icon: "🏆", label: "Bracket Manager", desc: "Generate brackets & report match results", path: "/admin/bracket", color: "#a855f7" },
]

function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      padding: '60px 24px',
    }}>
      <div style={{maxWidth: 700, margin: '0 auto'}}>
        <AdminTopBar showBack={false} />
        <div style={{
          display:'flex', alignItems:'center', gap:16,
          marginBottom: 40,
          paddingBottom: 24,
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            width:52, height:52,
            background:'linear-gradient(135deg,#7c3aed,#a855f7)',
            borderRadius:14,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:26,
          }}>⚔️</div>
          <div>
            <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700}}>Admin Dashboard</h1>
            <p style={{color:'var(--text-secondary)',fontSize:14}}>Campus Clash — Control Panel</p>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16}}>
          {adminActions.map((action) => (
            <div
              key={action.path}
              onClick={() => navigate(action.path)}
              style={{
                background:'var(--bg-card)',
                border:'1px solid var(--border)',
                borderRadius:16,
                padding:24,
                cursor:'pointer',
                transition:'all 0.22s',
                position:'relative',
                overflow:'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = action.color + '66'
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = `0 12px 32px ${action.color}22`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                width:48,height:48,
                background:action.color+'22',
                border:`1px solid ${action.color}44`,
                borderRadius:12,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:22, marginBottom:14,
              }}>{action.icon}</div>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:700,marginBottom:6}}>{action.label}</h3>
              <p style={{fontSize:13,color:'var(--text-muted)'}}>{action.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
