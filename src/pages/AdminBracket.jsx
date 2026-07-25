import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"

function AdminBracket() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [selectedId, setSelectedId] = useState("")
  const [rounds, setRounds] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    API.get("/tournament/all").then(res => setTournaments(res.data)).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedId) { setRounds(null); return }
    loadBracket(selectedId)
  }, [selectedId])

  const loadBracket = async (id) => {
    try {
      const res = await API.get(`/tournament/bracket/${id}`)
      setRounds(res.data.bracket ? res.data.bracket.rounds : null)
    } catch {
      setRounds(null)
    }
  }

  const handleGenerate = async () => {
    if (!selectedId) return
    setGenerating(true)
    try {
      const res = await API.post(`/tournament/admin/generate-bracket/${selectedId}`)
      setRounds(res.data.rounds)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate bracket")
    } finally {
      setGenerating(false)
    }
  }

  const handleReportWinner = async (roundIndex, matchIndex, winnerSlot) => {
    setLoading(true)
    try {
      const res = await API.post(`/tournament/admin/report-match/${selectedId}`, {
        round_index: roundIndex, match_index: matchIndex, winner_slot: winnerSlot
      })
      setRounds(res.data.rounds)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to record result")
    } finally {
      setLoading(false)
    }
  }

  const pageStyle = { minHeight:'100vh', background:'var(--bg-dark)', padding:'40px 24px' }
  const innerStyle = { maxWidth: 900, margin:'0 auto' }

  const slotStyle = (isWinner) => ({
    padding:'10px 14px', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center',
    background: isWinner ? 'var(--green-bg)' : 'var(--bg-surface)',
    border: `1px solid ${isWinner ? '#22c55e44' : 'var(--border)'}`,
    color: isWinner ? 'var(--green)' : 'var(--text-primary)',
    marginBottom: 6, fontSize: 14, fontWeight: isWinner ? 700 : 500,
  })

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <AdminTopBar />
        <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:6}}>🏆 Bracket Manager</h1>
        <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:32}}>Generate the bracket and report match winners round by round.</p>

        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:20,padding:32,marginBottom:24}}>
          <div className="field-group" style={{marginBottom: rounds ? 20 : 0}}>
            <label>Tournament</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">Select tournament...</option>
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}{t.has_bracket ? " (bracket generated)" : ""}</option>)}
            </select>
          </div>

          {selectedId && !rounds && (
            <button className="btn-primary" style={{marginTop:20}} onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating..." : "⚡ Generate Bracket"}
            </button>
          )}

          {selectedId && rounds && (
            <button className="btn-secondary" onClick={handleGenerate} disabled={generating}>
              {generating ? "Regenerating..." : "🔄 Regenerate Bracket"}
            </button>
          )}
        </div>

        {rounds && (
          <div style={{display:'flex', gap:24, overflowX:'auto', paddingBottom:16}}>
            {rounds.map((round, ridx) => (
              <div key={ridx} style={{minWidth:260, flexShrink:0}}>
                <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,marginBottom:14,color:'var(--purple-light)'}}>
                  {ridx === rounds.length - 1 ? "🏁 Final" : `Round ${ridx + 1}`}
                </div>
                {round.map((match, midx) => (
                  <div key={match.match_id} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:12,marginBottom:16}}>
                    <div
                      style={{...slotStyle(match.winner && match.a && match.winner.registration_id === match.a.registration_id), cursor: match.a && !match.winner ? 'pointer':'default'}}
                      onClick={() => match.a && !match.winner && handleReportWinner(ridx, midx, "a")}
                    >
                      <span>{match.a ? match.a.name : "TBD"}</span>
                      {match.a && !match.winner && <span style={{fontSize:11,opacity:0.6}}>tap to win</span>}
                    </div>
                    <div
                      style={{...slotStyle(match.winner && match.b && match.winner.registration_id === match.b.registration_id), cursor: match.b && !match.winner ? 'pointer':'default'}}
                      onClick={() => match.b && !match.winner && handleReportWinner(ridx, midx, "b")}
                    >
                      <span>{match.b ? match.b.name : "TBD"}</span>
                      {match.b && !match.winner && <span style={{fontSize:11,opacity:0.6}}>tap to win</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {loading && <p style={{color:'var(--text-secondary)',marginTop:16}}>Updating...</p>}
      </div>
    </div>
  )
}

export default AdminBracket
