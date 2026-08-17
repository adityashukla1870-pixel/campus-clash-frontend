import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FiAward, FiFlag, FiClock, FiArrowLeft } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { SkeletonBracket, SkeletonText } from "../components/Skeleton"

function Bracket() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => {
    API.get(`/tournament/bracket/${id}`).then(res => setData(res.data)).catch(console.error)
  }, [id])

  const pageStyle = { minHeight:'100vh', background:'var(--bg-dark)', padding:'110px 24px 60px' }
  const innerStyle = { maxWidth: 900, margin:'0 auto' }

  const slotStyle = (isWinner) => ({
    padding:'10px 14px', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center',
    background: isWinner ? 'var(--green-bg)' : 'var(--bg-surface)',
    border: `1px solid ${isWinner ? '#22c55e44' : 'var(--border)'}`,
    color: isWinner ? 'var(--green)' : 'var(--text-primary)',
    marginBottom: 6, fontSize: 14, fontWeight: isWinner ? 700 : 500,
  })

  if (!data) {
    return (
      <>
        <Navbar />
        <div style={pageStyle}>
          <div style={innerStyle}>
            <SkeletonText width="150px" height={14} style={{ marginBottom: 8 }} />
            <SkeletonText width="300px" height={28} style={{ marginBottom: 24 }} />
            <SkeletonBracket />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={pageStyle}>
        <div style={innerStyle}>
          <div style={{cursor:'pointer',color:'var(--text-secondary)',fontSize:14,marginBottom:24}} onClick={() => navigate(-1)}><FiArrowLeft /> Back</div>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:6}}><FiAward /> {data.tournament_name}</h1>

          {data.status === "completed" && (
            <div style={{background:'var(--green-bg)',border:'1px solid #22c55e44',borderRadius:12,padding:16,marginBottom:24,textAlign:'center'}}>
              <div style={{fontSize:28,marginBottom:6}}><FiAward /></div>
              <p style={{color:'var(--green)',fontWeight:600}}>Tournament Completed</p>
            </div>
          )}

          {!data.bracket ? (
            <div style={{textAlign:'center',padding:'60px 24px',color:'var(--text-muted)'}}>
              <div style={{fontSize:48,marginBottom:16}}><FiClock /></div>
              <p>Bracket hasn't been generated yet. Check back after registration closes.</p>
            </div>
          ) : (
            <div style={{display:'flex', gap:24, overflowX:'auto', paddingBottom:16}}>
              {data.bracket.rounds.map((round, ridx) => (
                <div key={ridx} style={{minWidth:260, flexShrink:0}}>
                  <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,marginBottom:14,color:'var(--purple-light)'}}>
                    {ridx === data.bracket.rounds.length - 1 ? <><FiFlag /> Final</> : `Round ${ridx + 1}`}
                  </div>
                  {round.map((match) => (
                    <div key={match.match_id} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:12,marginBottom:16}}>
                      <div style={slotStyle(match.winner && match.a && match.winner.registration_id === match.a.registration_id)}>
                        {match.a ? match.a.name : "TBD"}
                      </div>
                      <div style={slotStyle(match.winner && match.b && match.winner.registration_id === match.b.registration_id)}>
                        {match.b ? match.b.name : "TBD"}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Bracket
