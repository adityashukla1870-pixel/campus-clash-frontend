import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"

function AdminCreateTournament() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [entryFee, setEntryFee] = useState("")
  const [date, setDate] = useState("")
  const [maxPlayers, setMaxPlayers] = useState("")
  const [game, setGame] = useState("")
  const [prizePool, setPrizePool] = useState("")
  const [mode, setMode] = useState("solo")
  const [teamSize, setTeamSize] = useState("4")
  const [format, setFormat] = useState("quick")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await API.post("/tournament/create", {
        name, game,
        entry_fee: Number(entryFee),
        prize_pool: Number(prizePool),
        max_players: Number(maxPlayers),
        mode,
        team_size: mode === "squad" ? Number(teamSize) : 1,
        format
      })
      alert(res.data.message || res.data.error)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create tournament")
    } finally {
      setLoading(false)
    }
  }

  const pageStyle = { minHeight:'100vh', background:'var(--bg-dark)', padding:'40px 24px' }
  const innerStyle = { maxWidth:560, margin:'0 auto' }
  const modeBtnStyle = (active) => ({
    flex: 1, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
    border: `1px solid ${active ? 'var(--purple)' : 'var(--border)'}`,
    background: active ? 'var(--purple-glow)' : 'var(--bg-surface)',
    color: active ? 'var(--purple-light)' : 'var(--text-secondary)',
    fontWeight: 600, transition: 'all 0.2s',
  })

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:32}}>
          <AdminTopBar />
        </div>

        <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:6}}>🏆 Create Tournament</h1>
        <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:32}}>Fill in the details to launch a new tournament.</p>

        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:20, padding:32, position:'relative', overflow:'hidden',
        }}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(135deg,#7c3aed,#a855f7)'}}/>

          <div style={{display:'flex', flexDirection:'column', gap:20}}>
            <div className="field-group">
              <label>Tournament Name</label>
              <input placeholder="e.g. BGMI College League S1" onChange={e => setName(e.target.value)} />
            </div>
            <div className="field-group">
              <label>Game</label>
              <input placeholder="e.g. BGMI, Free Fire, Valorant" onChange={e => setGame(e.target.value)} />
            </div>

            <div className="field-group">
              <label>Registration Mode</label>
              <div style={{display:'flex', gap:10}}>
                <div style={modeBtnStyle(mode === 'solo')} onClick={() => setMode('solo')}>🧍 Solo</div>
                <div style={modeBtnStyle(mode === 'squad')} onClick={() => setMode('squad')}>👥 Squad</div>
              </div>
            </div>

            <div className="field-group">
              <label>Tournament Format</label>
              <div style={{display:'flex', gap:10}}>
                <div style={modeBtnStyle(format === 'quick')} onClick={() => setFormat('quick')}>
                  ⚡ Quick Match
                </div>
                <div style={modeBtnStyle(format === 'full')} onClick={() => setFormat('full')}>
                  🏟️ Full Tournament
                </div>
              </div>
              <p style={{fontSize:12, color:'var(--text-muted)', marginTop:8}}>
                {format === 'quick'
                  ? "Single room + one winner — same as before, good for casual matches."
                  : "Groups → Playoffs → Finals with a points-based leaderboard. Manage stages after creating."}
              </p>
            </div>

            {mode === 'squad' && (
              <div className="field-group">
                <label>Team Size (players per squad)</label>
                <input type="number" min="2" placeholder="e.g. 4" value={teamSize} onChange={e => setTeamSize(e.target.value)} />
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div className="field-group">
                <label>Entry Fee (₹)</label>
                <input type="number" placeholder="0" onChange={e => setEntryFee(e.target.value)} />
              </div>
              <div className="field-group">
                <label>Prize Pool (₹)</label>
                <input type="number" placeholder="0" onChange={e => setPrizePool(e.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <label>{mode === 'squad' ? 'Max Teams' : 'Max Players'}</label>
              <input type="number" placeholder="e.g. 100" onChange={e => setMaxPlayers(e.target.value)} />
            </div>
            <div className="field-group">
              <label>Tournament Date</label>
              <input type="datetime-local" onChange={e => setDate(e.target.value)} />
            </div>

            <button className="btn-primary" style={{width:'100%',justifyContent:'center',marginTop:4}} onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "🚀 Create Tournament"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCreateTournament
