import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"

function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get("/tournament/leaderboard")
      .then(res => setRows(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pageStyle = { minHeight:'100vh', background:'var(--bg-dark)', padding:'110px 24px 60px' }
  const innerStyle = { maxWidth: 760, margin:'0 auto' }

  const medal = (rank) => {
    if (rank === 0) return "🥇"
    if (rank === 1) return "🥈"
    if (rank === 2) return "🥉"
    return `#${rank + 1}`
  }

  return (
    <>
      <Navbar />
      <div style={pageStyle}>
        <div style={innerStyle}>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:6}}>🏆 Leaderboard</h1>
          <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:32}}>Top players ranked by tournament wins.</p>

          {loading ? (
            <div style={{color:'var(--text-secondary)',textAlign:'center',padding:40}}>Loading...</div>
          ) : rows.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 24px',color:'var(--text-muted)'}}>
              <div style={{fontSize:48,marginBottom:16}}>🎯</div>
              <p>No completed tournaments yet — be the first champion!</p>
            </div>
          ) : (
            <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden'}}>
              {rows.map((r, i) => (
                <div key={r.user_id} style={{
                  display:'flex', alignItems:'center', gap:16, padding:'16px 20px',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i < 3 ? 'var(--purple-glow)' : 'transparent',
                }}>
                  <div style={{width:40, fontSize: i < 3 ? 22 : 15, fontWeight:700, color: i < 3 ? 'var(--gold)' : 'var(--text-secondary)', textAlign:'center'}}>
                    {medal(i)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, fontSize:15}}>{r.name}</div>
                    {r.college && <div style={{fontSize:12, color:'var(--text-muted)'}}>{r.college}</div>}
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:700, color:'var(--cyan)'}}>{r.wins} 🏆</div>
                    <div style={{fontSize:12, color:'var(--gold)'}}>₹{r.prize_won} won</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Leaderboard
