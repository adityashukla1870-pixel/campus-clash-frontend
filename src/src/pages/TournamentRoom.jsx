import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"

function TournamentRoom() {
  const { id } = useParams()
  const [timeLeft, setTimeLeft] = useState("")
  const [room, setRoom] = useState(null)

  useEffect(() => {
    API.get(`/tournament/room/${id}`)
      .then(res => setRoom(res.data))
      .catch(console.error)
  }, [id])

  useEffect(() => {
    if (!room || !room.room_id) return
    const interval = setInterval(() => {
      const diff = new Date(room.match_start_time).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft("Match Started 🚀"); clearInterval(interval); return }
      const minutes = Math.floor((diff / 60000) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      setTimeLeft(`${String(minutes).padStart(2,'0')} : ${String(seconds).padStart(2,'0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [room])

  const roomPageStyle = {
    minHeight: '100vh',
    padding: '110px 24px 60px',
    background: 'var(--bg-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: 40,
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  }

  if (!room) {
    return (
      <>
        <Navbar />
        <div style={roomPageStyle}>
          <div style={{color:'var(--text-secondary)'}}>Loading room details...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={roomPageStyle}>
        <div style={cardStyle}>
          {/* Top accent line */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(135deg,#7c3aed,#a855f7)'}}/>

          <div style={{fontSize:48,marginBottom:16}}>🎮</div>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:8}}>Match Room</h1>

          {!room?.room_id ? (
            <div style={{marginTop:24}}>
              <div style={{
                background:'var(--yellow-bg)',
                border:'1px solid #facc1544',
                borderRadius:12,
                padding:'20px 24px',
              }}>
                <div style={{fontSize:32,marginBottom:8}}>⏳</div>
                <p style={{color:'var(--yellow)',fontWeight:600,fontSize:16}}>Waiting for admin to release room</p>
                <p style={{color:'var(--text-muted)',fontSize:14,marginTop:6}}>Come back shortly — details will appear here.</p>
              </div>
            </div>
          ) : (
            <div style={{marginTop:24}}>
              <div style={{
                background:'var(--bg-surface)',
                border:'1px solid var(--border)',
                borderRadius:14,
                padding:24,
                marginBottom:16,
              }}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,textAlign:'left'}}>
                  <div>
                    <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--text-muted)',marginBottom:4}}>Room ID</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:20,fontWeight:600,color:'var(--cyan)'}}>{room.room_id}</div>
                  </div>
                  <div>
                    <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--text-muted)',marginBottom:4}}>Password</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:20,fontWeight:600,color:'var(--purple-light)'}}>{room.room_password}</div>
                  </div>
                </div>
              </div>

              <div style={{
                background:'var(--purple-glow)',
                border:'1px solid var(--border-glow)',
                borderRadius:14,
                padding:20,
              }}>
                <div style={{fontSize:12,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--text-muted)',marginBottom:6}}>Match Starts In</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:40,fontWeight:600,color:'var(--cyan)',letterSpacing:4}}>{timeLeft}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TournamentRoom
