import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { SkeletonRoom, SkeletonText } from "../components/Skeleton"
import { FiMonitor, FiClock, FiSend, FiCopy, FiCheckCircle, FiUsers, FiTarget, FiArrowLeft, FiWifi } from "react-icons/fi"

function TournamentRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState("")
  const [room, setRoom] = useState(null)
  const [tournament, setTournament] = useState(null)
  const [isFullFormat, setIsFullFormat] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  useEffect(() => {
    API.get(`/tournament/${id}`)
      .then(res => {
        setTournament(res.data)
        if (res.data.format === "full") {
          setIsFullFormat(true)
          navigate(`/tournament/${id}/standings`, { replace: true })
        } else {
          API.get(`/tournament/room/${id}`)
            .then(r => setRoom(r.data))
            .catch(console.error)
        }
      })
      .catch(() => {
        API.get(`/tournament/room/${id}`).then(r => setRoom(r.data)).catch(console.error)
      })
  }, [id, navigate])

  useEffect(() => {
    if (!room || !room.room_id) return
    const interval = setInterval(() => {
      const diff = new Date(room.match_start_time).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft("LIVE"); clearInterval(interval); return }
      const hrs = Math.floor(diff / 3600000)
      const mins = Math.floor((diff / 60000) % 60)
      const secs = Math.floor((diff / 1000) % 60)
      setTimeLeft(`${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [room])

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'id') { setCopiedId(true); setTimeout(() => setCopiedId(false), 2000) }
    if (type === 'pass') { setCopiedPass(true); setTimeout(() => setCopiedPass(false), 2000) }
  }

  const pageStyle = {
    minHeight: '100vh',
    padding: '100px 24px 60px',
    background: 'var(--bg-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  if (isFullFormat || !room) {
    return (
      <>
        <Navbar />
        <div style={pageStyle}>
          {isFullFormat ? (
            <SkeletonText width="200px" height={16} />
          ) : (
            <>
              <SkeletonRoom />
              <SkeletonText width="250px" height={16} style={{ marginTop: 16 }} />
            </>
          )}
        </div>
      </>
    )
  }

  const isLive = timeLeft === "LIVE"

  return (
    <>
      <Navbar />
      <div style={pageStyle}>
        <div style={{ maxWidth: 520, width: '100%' }}>

          {/* Back button */}
          <div
            onClick={() => navigate("/my-tournaments")}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', marginBottom: 20, transition: 'color 0.2s' }}
          >
            <FiArrowLeft size={14} /> Back to My Matches
          </div>

          {/* Main card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            overflow: 'hidden',
            position: 'relative',
          }}>

            {/* Top gradient accent */}
            <div style={{ height: 4, background: 'linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4)' }} />

            {/* Header section */}
            <div style={{ padding: '32px 32px 0', textAlign: 'center' }}>
              {/* Live badge */}
              {isLive && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 999, padding: '5px 14px', marginBottom: 16,
                  fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                  LIVE NOW
                </div>
              )}

              {/* Game & Tournament */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <FiMonitor size={14} style={{ color: 'var(--cyan)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {tournament?.game || "Tournament"}
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
                color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.2,
              }}>
                {tournament?.name || "Match Room"}
              </h1>

              {tournament?.entry_fee != null && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Entry Fee: <span style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{tournament.entry_fee}</span>
                  {tournament?.prize_pool != null && (
                    <> · Prize Pool: <span style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{tournament.prize_pool}</span></>
                  )}
                </div>
              )}
            </div>

            {/* Room details or waiting */}
            {!room?.room_id ? (
              <div style={{ padding: 32 }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(234,179,8,0.08), rgba(234,179,8,0.02))',
                  border: '1px solid rgba(234,179,8,0.2)',
                  borderRadius: 16, padding: '32px 24px', textAlign: 'center',
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <FiClock size={28} style={{ color: 'var(--gold)' }} />
                  </div>
                  <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>
                    Waiting for Room Details
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
                    Admin will release the room ID & password shortly.<br />
                    Keep this page open — it updates automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 32px 32px' }}>

                {/* Room ID & Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {/* Room ID */}
                  <div
                    onClick={() => copyToClipboard(room.room_id, 'id')}
                    style={{
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 14, padding: '18px 16px', cursor: 'pointer',
                      transition: 'all 0.2s', position: 'relative',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                      Room ID
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--cyan)', wordBreak: 'break-all', lineHeight: 1.3 }}>
                      {room.room_id}
                    </div>
                    <div style={{ position: 'absolute', top: 12, right: 12, color: copiedId ? 'var(--green)' : 'var(--text-muted)' }}>
                      {copiedId ? <FiCheckCircle size={14} /> : <FiCopy size={14} />}
                    </div>
                  </div>

                  {/* Password */}
                  <div
                    onClick={() => copyToClipboard(room.room_password, 'pass')}
                    style={{
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 14, padding: '18px 16px', cursor: 'pointer',
                      transition: 'all 0.2s', position: 'relative',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-light)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                      Password
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--purple-light)', wordBreak: 'break-all', lineHeight: 1.3 }}>
                      {room.room_password}
                    </div>
                    <div style={{ position: 'absolute', top: 12, right: 12, color: copiedPass ? 'var(--green)' : 'var(--text-muted)' }}>
                      {copiedPass ? <FiCheckCircle size={14} /> : <FiCopy size={14} />}
                    </div>
                  </div>
                </div>

                {/* Copy all button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Room ID: ${room.room_id}\nPassword: ${room.room_password}`)
                    setCopiedId(true); setCopiedPass(true)
                    setTimeout(() => { setCopiedId(false); setCopiedPass(false) }, 2000)
                  }}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
                    background: 'var(--bg-surface)', color: 'var(--text-primary)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--purple-glow)'; e.currentTarget.style.borderColor = 'var(--purple)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  {copiedId && copiedPass ? <><FiCheckCircle size={14} /> Copied!</> : <><FiCopy size={14} /> Copy Room ID & Password</>}
                </button>

                {/* Match timings */}
                {room.match_start_time && (
                  <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10, marginBottom: 16, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                      Match Schedule
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span>Match Start:</span> {new Date(room.match_start_time).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: false })} PM
                    </div>
                  </div>
                )}

                {/* Countdown timer */}
                <div style={{
                  background: isLive
                    ? 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))'
                    : 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(6,182,212,0.04))',
                  border: `1px solid ${isLive ? 'rgba(239,68,68,0.3)' : 'rgba(6,182,212,0.3)'}`,
                  borderRadius: 16, padding: '24px 20px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                    {isLive ? 'Match In Progress' : 'Match Starts In'}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: isLive ? 32 : 42,
                    fontWeight: 800, letterSpacing: 4,
                    color: isLive ? '#ef4444' : 'var(--cyan)',
                  }}>
                    {isLive ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <FiWifi size={28} /> JOIN NOW
                      </span>
                    ) : timeLeft}
                  </div>
                </div>

                {/* Quick tips */}
                <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Quick Tips
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    • Tap Room ID or Password to copy instantly<br />
                    • Join the room 2-3 mins before match time<br />
                    • Screenshot your result after the match
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </>
  )
}

export default TournamentRoom
