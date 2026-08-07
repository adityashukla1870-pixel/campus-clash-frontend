import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"
import { SkeletonText, SkeletonBlock, SkeletonCard } from "../components/Skeleton"

function AdminReleaseRoom() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [selectedId, setSelectedId] = useState("")
  const [roomId, setRoomId] = useState("")
  const [password, setPassword] = useState("")
  const [matchTime, setMatchTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    API.get("/tournament/all").then(res => setTournaments(res.data)).catch(console.error).finally(() => setInitialLoading(false))
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await API.post(`/tournament/admin/release-room/${selectedId}`, {
        room_id: roomId, password, start_time: new Date(matchTime).toISOString()
      })
      alert("Room Released ✅")
    } catch { alert("Failed to release room") }
    finally { setLoading(false) }
  }

  const pageStyle = { minHeight:'100vh', background:'var(--bg-dark)', padding:'40px 24px' }
  const innerStyle = { maxWidth:540, margin:'0 auto' }

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <AdminTopBar />
        {initialLoading ? (
          <>
            <SkeletonText width="180px" height={28} style={{ marginBottom: 6 }} />
            <SkeletonText width="300px" height={14} style={{ marginBottom: 32 }} />
            <SkeletonBlock height={200} style={{ borderRadius: 20, marginBottom: 24 }} />
            <SkeletonCard height={180} />
          </>
        ) : (
          <>
            <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:6}}>🎮 Release Room</h1>
            <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:32}}>Share room credentials with registered players.</p>

            <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:20,padding:32,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(135deg,#06b6d4,#22d3ee)'}}/>
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div className="field-group">
                  <label>Tournament</label>
                  <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                    <option value="">Select tournament...</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Room ID</label>
                  <input placeholder="Enter game room ID" onChange={e => setRoomId(e.target.value)} />
                </div>
                <div className="field-group">
                  <label>Password</label>
                  <input placeholder="Enter room password" onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="field-group">
                  <label>Match Start Time</label>
                  <input type="datetime-local" onChange={e => setMatchTime(e.target.value)} />
                </div>
                <button className="btn-primary" style={{width:'100%',justifyContent:'center',marginTop:4}} onClick={handleSubmit} disabled={loading || !selectedId}>
                  {loading ? "Releasing..." : "📡 Release Room"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminReleaseRoom
