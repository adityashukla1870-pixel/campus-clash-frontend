import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { SkeletonRoom, SkeletonText } from "../components/Skeleton"
import { FiMonitor, FiClock, FiCopy, FiCheckCircle, FiUsers, FiTarget, FiArrowLeft, FiWifi, FiGrid, FiUser, FiZap, FiAward, FiCalendar, FiInfo } from "react-icons/fi"

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
    const target = room?.room_id ? room.match_start_time : tournament?.scheduled_time
    if (!target) return

    const interval = setInterval(() => {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft("LIVE"); clearInterval(interval); return }
      const d = Math.floor(diff / 86400000)
      const hrs = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      if (d > 0) setTimeLeft(`${d}d ${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`)
      else setTimeLeft(`${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [room, tournament])

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

  if (isFullFormat || !tournament) {
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
  const isSquad = tournament.mode === "squad"
  const scheduledTime = tournament.scheduled_time

  return (
    <>
      <Navbar />
      <div style={pageStyle}>
        <div style={{ maxWidth: 540, width: '100%' }}>

          <div
            onClick={() => navigate("/my-tournaments")}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', marginBottom: 20, transition: 'color 0.2s' }}
          >
            <FiArrowLeft size={14} /> Back to My Matches
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            overflow: 'hidden',
            position: 'relative',
          }}>

            <div style={{ height: 4, background: 'linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4)' }} />

            <div style={{ padding: '28px 28px 0', textAlign: 'center' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <FiMonitor size={14} style={{ color: 'var(--cyan)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {tournament.game}
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800,
                color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.2,
              }}>
                {tournament.name}
              </h1>

              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, fontWeight: 600, background: 'rgba(6,182,212,0.15)', color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiMonitor size={10} /> {tournament.game}
                </span>
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, fontWeight: 600, background: isSquad ? 'rgba(124,58,237,0.15)' : 'rgba(168,85,247,0.15)', color: isSquad ? 'var(--cyan)' : 'var(--purple-light)', border: `1px solid ${isSquad ? 'rgba(6,182,212,0.25)' : 'rgba(168,85,247,0.25)'}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiUsers size={10} /> {isSquad ? `Squad (${tournament.team_size})` : 'Solo'}
                </span>
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, fontWeight: 600, background: tournament.format === 'full' ? 'rgba(234,179,8,0.15)' : 'rgba(6,182,212,0.08)', color: tournament.format === 'full' ? 'var(--gold)' : 'var(--text-muted)', border: `1px solid ${tournament.format === 'full' ? 'rgba(234,179,8,0.25)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {tournament.format === 'full' ? <><FiAward size={10} /> Multi-Stage</> : <><FiZap size={10} /> Quick Match</>}
                </span>
              </div>
            </div>

            <div style={{ padding: '0 28px 28px' }}>

              {scheduledTime && (
                <div style={{
                  background: isLive
                    ? 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))'
                    : 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(6,182,212,0.04))',
                  border: `1px solid ${isLive ? 'rgba(239,68,68,0.3)' : 'rgba(6,182,212,0.3)'}`,
                  borderRadius: 16, padding: '20px', marginBottom: 16, display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiCalendar size={18} style={{ color: isLive ? '#ef4444' : 'var(--cyan)' }} />
                    <div>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {isLive ? 'Match In Progress' : 'Match Starts In'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {new Date(scheduledTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                        {new Date(scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: isLive ? 16 : 22,
                    fontWeight: 800, letterSpacing: 2,
                    color: isLive ? '#ef4444' : 'var(--cyan)',
                    background: isLive ? 'rgba(239,68,68,0.1)' : 'rgba(6,182,212,0.1)',
                    padding: '6px 14px', borderRadius: 10,
                  }}>
                    {isLive ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiWifi size={18} /> JOIN NOW
                      </span>
                    ) : timeLeft || "--:--:--"}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Entry Fee</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>₹{tournament.entry_fee}</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Prize Pool</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>₹{tournament.prize_pool}</div>
                </div>
              </div>

              {tournament.prize_breakdown?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiAward size={11} style={{ color: 'var(--gold)' }} /> Prize Breakdown
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {tournament.prize_breakdown.map((row) => (
                      <div key={row.rank} style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: '10px 14px', flex: '1 1 auto', minWidth: 80,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: row.rank === '1' ? 'var(--gold)' : 'var(--text-secondary)' }}>
                          {row.rank === '1' ? '🥇' : row.rank === '2' ? '🥈' : row.rank === '3' ? '🥉' : `#${row.rank}`}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>₹{row.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tournament.points_table && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiTarget size={11} style={{ color: 'var(--cyan)' }} /> Scoring System
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {Object.entries(tournament.points_table)
                      .sort((a, b) => Number(a[0]) - Number(b[0]))
                      .slice(0, 5)
                      .map(([rank, pts]) => (
                        <div key={rank} style={{
                          background: 'var(--bg-surface)', border: '1px solid var(--border)',
                          borderRadius: 8, padding: '8px 12px', textAlign: 'center',
                        }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>#{rank}</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cyan)' }}>{pts} pts</div>
                        </div>
                      ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiTarget size={11} /> Per Kill: <strong style={{ color: 'var(--cyan)' }}>{tournament.kill_point_value} {tournament.kill_point_value === 1 ? 'point' : 'points'}</strong>
                  </div>
                </div>
              )}

              {!room?.room_id && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(234,179,8,0.08), rgba(234,179,8,0.02))',
                  border: '1px solid rgba(234,179,8,0.2)',
                  borderRadius: 16, padding: '24px 20px', textAlign: 'center', marginBottom: 16,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}>
                    <FiClock size={24} style={{ color: 'var(--gold)' }} />
                  </div>
                  <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                    Waiting for Room Details
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }}>
                    Admin will release the room ID & password shortly.<br />
                    This page updates automatically.
                  </p>
                </div>
              )}

              {room?.room_id && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div
                      onClick={() => copyToClipboard(room.room_id, 'id')}
                      style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 14, padding: '16px', cursor: 'pointer',
                        transition: 'all 0.2s', position: 'relative',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                        Room ID
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--cyan)', wordBreak: 'break-all', lineHeight: 1.3 }}>
                        {room.room_id}
                      </div>
                      <div style={{ position: 'absolute', top: 12, right: 12, color: copiedId ? 'var(--green)' : 'var(--text-muted)' }}>
                        {copiedId ? <FiCheckCircle size={14} /> : <FiCopy size={14} />}
                      </div>
                    </div>

                    <div
                      onClick={() => copyToClipboard(room.room_password, 'pass')}
                      style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 14, padding: '16px', cursor: 'pointer',
                        transition: 'all 0.2s', position: 'relative',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-light)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                        Password
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--purple-light)', wordBreak: 'break-all', lineHeight: 1.3 }}>
                        {room.room_password}
                      </div>
                      <div style={{ position: 'absolute', top: 12, right: 12, color: copiedPass ? 'var(--green)' : 'var(--text-muted)' }}>
                        {copiedPass ? <FiCheckCircle size={14} /> : <FiCopy size={14} />}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Room ID: ${room.room_id}\nPassword: ${room.room_password}`)
                      setCopiedId(true); setCopiedPass(true)
                      setTimeout(() => { setCopiedId(false); setCopiedPass(false) }, 2000)
                    }}
                    style={{
                      width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
                      background: 'var(--bg-surface)', color: 'var(--text-primary)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--purple-glow)'; e.currentTarget.style.borderColor = 'var(--purple)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    {copiedId && copiedPass ? <><FiCheckCircle size={14} /> Copied!</> : <><FiCopy size={14} /> Copy Room ID & Password</>}
                  </button>
                </>
              )}

              {room?.slot_assignments && Object.keys(room.slot_assignments).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiGrid size={12} style={{ color: 'var(--cyan)' }} />
                    Lobby Slot Assignments
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {Object.entries(room.slot_assignments)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([slot, data]) => (
                        <div
                          key={slot}
                          style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border)',
                            borderRadius: 10, padding: '10px 12px',
                            display: 'flex', alignItems: 'center', gap: 8,
                          }}
                        >
                          <div style={{
                            width: 26, height: 26, borderRadius: 6,
                            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0
                          }}>
                            {slot}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {data.team_name}
                            </div>
                          </div>
                          <FiUser size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiInfo size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {room?.room_id
                    ? "Join the room 2-3 mins before match time. Screenshot your result after."
                    : "Room details will appear here once the admin releases them. Stay on this page."}
                </div>
              </div>

            </div>
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
