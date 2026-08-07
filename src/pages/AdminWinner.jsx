import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"

function AdminWinner() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [selectedTournament, setSelectedTournament] = useState("")
  const [participants, setParticipants] = useState([])
  const [selectedWinner, setSelectedWinner] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedTournamentData, setSelectedTournamentData] = useState(null)

  useEffect(() => {
    API.get("/tournament/all").then(res => setTournaments(res.data)).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedTournament) return
    API.get(`/tournament/participants/${selectedTournament}`).then(res => setParticipants(res.data)).catch(console.error)
    API.get(`/tournament/${selectedTournament}`).then(res => setSelectedTournamentData(res.data)).catch(() => setSelectedTournamentData(null))
  }, [selectedTournament])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await API.post("/tournament/admin/declare-winner", {
        tournament_id: selectedTournament, winner_id: selectedWinner
      })
      alert(res.data.message || res.data.error)
    } catch { alert("Failed to declare winner") }
    finally { setLoading(false) }
  }

  const pageStyle = { minHeight:'100vh', background:'var(--bg-dark)', padding:'40px 24px' }
  const innerStyle = { maxWidth:540, margin:'0 auto' }

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <AdminTopBar />
        <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:6}}>🥇 Declare Winner</h1>
        <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:32}}>Select the tournament and the winning player.</p>

        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:20,padding:32,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(135deg,#22c55e,#4ade80)'}}/>
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            <div className="field-group">
              <label>Tournament</label>
              <select onChange={e => setSelectedTournament(e.target.value)}>
                <option value="">Select tournament...</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Winner</label>
              <select onChange={e => setSelectedWinner(e.target.value)} disabled={!selectedTournament}>
                <option value="">Select winner...</option>
                {participants.map(p => <option key={p.user_id} value={p.user_id}>{p.name}</option>)}
              </select>
            </div>
            {selectedTournamentData && (
              <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,padding:14,fontSize:13,color:'var(--text-secondary)'}}>
                <div><strong>Format:</strong> {selectedTournamentData.format === 'full' ? 'Full tournament / stages' : 'Quick match'}</div>
                <div><strong>Status:</strong> {selectedTournamentData.status}</div>
                {selectedTournamentData.winner_name && <div><strong>Current champion:</strong> {selectedTournamentData.winner_name}</div>}
              </div>
            )}
            {selectedWinner && (
              <div style={{background:'var(--green-bg)',border:'1px solid #22c55e44',borderRadius:12,padding:16,textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:6}}>🏆</div>
                <p style={{color:'var(--green)',fontWeight:600}}>Ready to declare winner!</p>
              </div>
            )}
            <button className="btn-primary" style={{width:'100%',justifyContent:'center',background:'linear-gradient(135deg,#22c55e,#4ade80)',marginTop:4}} onClick={handleSubmit} disabled={loading || !selectedWinner}>
              {loading ? "Declaring..." : "🏆 Declare Winner"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminWinner
