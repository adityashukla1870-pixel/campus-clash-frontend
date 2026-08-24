import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { FiCheckCircle, FiCircle, FiStar, FiKey, FiArrowRight, FiTarget, FiAward, FiChevronDown, FiChevronUp, FiInfo, FiClock, FiZap } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { SkeletonTable, SkeletonText, SkeletonBlock } from "../components/Skeleton"
import "./StageStandings.css"

/* ─── How It Works cards ─── */
function HowItWorks() {
  const steps = [
    { icon: <FiTarget />, title: "3 Groups", desc: "15 teams split into Group A, B, C (5 each)" },
    { icon: <FiZap />, title: "9 Matches", desc: "3 days, 3 matches each — Round Robin format" },
    { icon: <FiAward />, title: "Overall Winner", desc: "All teams ranked together on one leaderboard. Top 3 win!" },
  ]
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 12, marginBottom: 24
    }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '16px 14px', textAlign: 'center'
        }}>
          <div style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 6 }}>{s.icon}</div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── Progress bar ─── */
function MatchProgress({ done, total }) {
  const pct = total > 0 ? (done / total) * 100 : 0
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Match Progress</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{done} / {total} completed</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 99,
            background: pct === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--purple), var(--cyan))',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>
      {pct === 100 && <FiCheckCircle style={{ color: 'var(--green)', fontSize: 20 }} />}
    </div>
  )
}

/* ─── Single match card ─── */
function MatchCard({ match }) {
  const isLive = !!match.room_id && match.status !== 'completed'
  const isDone = match.status === 'completed'

  const statusStyle = isDone
    ? { bg: 'rgba(0,200,120,0.1)', color: 'var(--green)', label: 'Completed' }
    : isLive
    ? { bg: 'rgba(0,180,255,0.1)', color: 'var(--cyan)', label: 'Live Now' }
    : { bg: 'var(--bg-surface)', color: 'var(--text-muted)', label: 'Upcoming' }

  const defaultTimings = {
    1: { idRelease: '8:20 PM', matchStart: '8:30 PM' },
    2: { idRelease: '9:00 PM', matchStart: '9:10 PM' },
    3: { idRelease: '9:40 PM', matchStart: '9:50 PM' },
    4: { idRelease: '8:20 PM', matchStart: '8:30 PM' },
    5: { idRelease: '9:00 PM', matchStart: '9:10 PM' },
    6: { idRelease: '9:40 PM', matchStart: '9:50 PM' },
    7: { idRelease: '8:20 PM', matchStart: '8:30 PM' },
    8: { idRelease: '9:00 PM', matchStart: '9:10 PM' },
    9: { idRelease: '9:40 PM', matchStart: '9:50 PM' },
  }
  const timing = defaultTimings[match.match_number]

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 14, marginBottom: 10,
      borderColor: isLive ? 'var(--cyan)' : isDone ? 'rgba(0,200,120,0.3)' : 'var(--border)'
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {match.pod_a_name}
          </span>
          <span style={{
            background: 'var(--bg-surface)', borderRadius: 6, padding: '2px 8px',
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 600
          }}>&</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {match.pod_b_name}
          </span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
          background: statusStyle.bg, color: statusStyle.color
        }}>
          {statusStyle.label}
        </span>
      </div>

      {/* Match number + map */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
        Match {match.match_number} {match.map && <>· {match.map}</>}
      </div>

      {/* Timings — UPCOMING */}
      {!isDone && !isLive && timing && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1, background: 'rgba(255,185,87,0.08)', border: '1px solid rgba(255,185,87,0.2)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>ID & Password</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ffb957' }}>{timing.idRelease}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: 16 }}>»</div>
          <div style={{ flex: 1, background: 'rgba(0,200,120,0.06)', border: '1px solid rgba(0,200,120,0.2)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Match Start</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>{timing.matchStart}</div>
          </div>
        </div>
      )}

      {/* Room details — LIVE */}
      {isLive && (
        <div style={{
          background: 'rgba(0,180,255,0.06)', border: '1px solid rgba(0,180,255,0.2)',
          borderRadius: 8, padding: '10px 12px', marginBottom: 6
        }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cyan)', marginBottom: 6, fontWeight: 600 }}>
            <FiKey /> Room Details
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>ROOM ID</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--cyan)' }}>{match.room_id}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>PASSWORD</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--cyan)' }}>{match.room_password}</div>
            </div>
            {match.match_start_time && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>STARTS AT</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {new Date(match.match_start_time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results — COMPLETED */}
      {isDone && (
        <div style={{ marginTop: 4 }}>
          {match.mvp && (
            <div style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 4, fontWeight: 600 }}>
              <FiStar /> MVP: {match.mvp.name} ({match.mvp.kills} kills)
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[...match.results].sort((a, b) => a.placement - b.placement).map(r => (
              <span key={r.registration_id} style={{
                fontSize: 11, background: 'var(--bg-surface)', borderRadius: 6,
                padding: '3px 8px', color: 'var(--text-secondary)'
              }}>
                #{r.placement} {r.name} <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{r.points}pts</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Podium card ─── */
function PodiumCard({ team, rank }) {
  const medals = ['🥇', '🥈', '🥉']
  const borders = ['var(--gold)', '#c0c0c0', '#cd7f32']
  const sizes = [36, 32, 28]
  return (
    <div style={{
      flex: 1, minWidth: 130, background: 'var(--bg-surface)',
      border: `2px solid ${borders[rank]}`, borderRadius: 14,
      padding: '18px 12px', textAlign: 'center',
      order: rank === 0 ? 1 : rank === 1 ? 0 : 2
    }}>
      <div style={{ fontSize: sizes[rank], marginBottom: 4 }}>{medals[rank]}</div>
      <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, marginBottom: 2 }}>{team.name}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{team.pod_name}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>{team.total_points}</div>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
        {team.total_kills} kills · {team.matches_played} matches
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
function CrossPodStandings() {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [detail, setDetail] = useState(null)
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGroups, setShowGroups] = useState(false)
  const [activeTab, setActiveTab] = useState("standings")

  useEffect(() => {
    if (!id) return
    Promise.all([
      API.get(`/tournament/${id}`),
      API.get(`/cross-pod/tournament/${id}`)
    ]).then(([tRes, rrRes]) => {
      setTournament(tRes.data)
      if (rrRes.data.length > 0) {
        const latest = rrRes.data[0]
        return Promise.all([
          API.get(`/cross-pod/${latest.id}`),
          API.get(`/cross-pod/${latest.id}/standings`)
        ]).then(([dRes, sRes]) => {
          setDetail(dRes.data)
          setStandings(sRes.data)
        })
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  // Auto-refresh every 30s if there are live matches
  useEffect(() => {
    if (!detail?.matches?.some(m => m.room_id && m.status !== 'completed')) return
    const interval = setInterval(() => {
      if (!detail?.id) return
      API.get(`/cross-pod/${detail.id}`).then(r => setDetail(r.data))
      API.get(`/cross-pod/${detail.id}/standings`).then(r => setStandings(r.data))
    }, 30000)
    return () => clearInterval(interval)
  }, [detail?.id])

  // Group matches by Day (Day 1, Day 2, Day 3)
  const getGroupPairName = (nameA, nameB) => {
    const extractLetter = (name) => {
      const match = name.match(/Group\s*([A-C])/i)
      return match ? match[1].toUpperCase() : name
    }
    const letterA = extractLetter(nameA)
    const letterB = extractLetter(nameB)
    const sorted = [letterA, letterB].sort().join('')
    return `Group ${sorted}`
  }

  const matchGroups = {}
  if (detail?.matches) {
    detail.matches.forEach(m => {
      const dayNum = Math.ceil(m.match_number / 3)
      const key = `Day ${dayNum}`
      if (!matchGroups[key]) matchGroups[key] = []
      matchGroups[key].push(m)
    })
  }

  // Per-group standings
  const groupStandings = {}
  standings.forEach(s => {
    if (!groupStandings[s.pod_name]) groupStandings[s.pod_name] = []
    groupStandings[s.pod_name].push(s)
  })

  const matchesDone = detail?.matches?.filter(m => m.status === 'completed').length || 0
  const matchesTotal = detail?.matches?.length || 0
  const liveMatch = detail?.matches?.find(m => m.room_id && m.status !== 'completed')

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="standings-page">
          <SkeletonText width="220px" height={28} style={{ marginBottom: 20 }} />
          <SkeletonBlock height={100} style={{ borderRadius: 12, marginBottom: 16 }} />
          <SkeletonBlock height={160} style={{ borderRadius: 16, marginBottom: 20 }} />
          <SkeletonTable rows={5} cols={5} />
        </div>
      </>
    )
  }

  if (!tournament) {
    return (
      <>
        <Navbar />
        <div className="standings-page" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <FiTarget style={{ fontSize: 40, color: 'var(--text-muted)', marginBottom: 12 }} />
          <h2 style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 6 }}>Tournament Not Found</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>This tournament may have been removed.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="standings-page">

        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="standings-title">{tournament.name}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 99,
              background: 'rgba(255,185,87,0.12)', color: '#ffb957', fontWeight: 600
            }}>{tournament.game}</span>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 99,
              background: 'rgba(0,180,255,0.1)', color: 'var(--cyan)', fontWeight: 600
            }}>Round Robin</span>
          </div>
        </div>

        {!detail && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <FiClock style={{ fontSize: 40, color: 'var(--text-muted)', marginBottom: 12 }} />
            <h2 style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 6 }}>Matches Coming Soon</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Round robin matches haven't been scheduled yet. Stay tuned!</p>
          </div>
        )}

        {detail && (
          <>
            {/* ─── HOW IT WORKS ─── */}
            <HowItWorks />

            {/* ─── PROGRESS ─── */}
            <MatchProgress done={matchesDone} total={matchesTotal} />

            {/* ─── LIVE ALERT ─── */}
            {liveMatch && (
              <div style={{
                background: 'rgba(0,180,255,0.08)', border: '1px solid rgba(0,180,255,0.25)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)',
                  animation: 'pulse 1.5s infinite'
                }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)' }}>LIVE: </span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {liveMatch.pod_a_name} vs {liveMatch.pod_b_name} — Match {liveMatch.match_number}
                  </span>
                </div>
              </div>
            )}

            {/* ─── TABS ─── */}
            <div className="page-tabs">
              <button className={`page-tab ${activeTab === 'standings' ? 'active' : ''}`}
                onClick={() => setActiveTab('standings')}>🏆 Leaderboard</button>
              <button className={`page-tab ${activeTab === 'matches' ? 'active' : ''}`}
                onClick={() => setActiveTab('matches')}>⚔️ Matches</button>
            </div>

            {/* ─── TAB: LEADERBOARD ─── */}
            {activeTab === 'standings' && standings.length > 0 && (
              <>
                {/* Podium */}
                {standings.length >= 3 && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <PodiumCard team={standings[1]} rank={1} />
                    <PodiumCard team={standings[0]} rank={0} />
                    <PodiumCard team={standings[2]} rank={2} />
                  </div>
                )}

                {/* Full table */}
                <div className="stage-block">
                  <div className="stage-block-header">
                    <h2><FiAward style={{ color: 'var(--gold)' }} /> Overall Rankings</h2>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>All Groups Combined</span>
                  </div>
                  <div className="standings-table-wrap">
                    <table className="standings-table">
                      <thead>
                        <tr>
                          <th>#</th><th>Team</th><th>Group</th><th>M</th><th>Wins</th><th>Kills</th><th>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((s, i) => (
                          <tr key={s.registration_id} style={i < 3 ? { background: 'rgba(212,175,55,0.06)' } : {}}>
                            <td style={{ fontWeight: i < 3 ? 700 : 400 }}>
                              {i < 3 ? ['🥇','🥈','🥉'][i] : s.rank}
                            </td>
                            <td style={{ fontWeight: i < 3 ? 700 : 400 }}>{s.name}</td>
                            <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.pod_name}</td>
                            <td>{s.matches_played}</td>
                            <td>{s.chicken_dinners}</td>
                            <td>{s.total_kills}</td>
                            <td className="points-cell">{s.total_points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Group-wise standings */}
                {Object.keys(groupStandings).length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <button onClick={() => setShowGroups(!showGroups)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 600, padding: '8px 0'
                      }}>
                      {showGroups ? <FiChevronUp /> : <FiChevronDown />}
                      View Group-wise Standings
                    </button>
                    {showGroups && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 8 }}>
                        {Object.entries(groupStandings).map(([groupName, teams]) => (
                          <div key={groupName} className="pod-block">
                            <div className="pod-block-header">
                              <h3>{groupName}</h3>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{teams.length} teams</span>
                            </div>
                            <table className="standings-table" style={{ fontSize: 12 }}>
                              <thead>
                                <tr><th>#</th><th>Team</th><th>M</th><th>Kills</th><th>Pts</th></tr>
                              </thead>
                              <tbody>
                                {teams.map(s => (
                                  <tr key={s.registration_id}>
                                    <td>{s.rank}</td>
                                    <td>{s.name}</td>
                                    <td>{s.matches_played}</td>
                                    <td>{s.total_kills}</td>
                                    <td className="points-cell">{s.total_points}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ─── TAB: MATCHES ─── */}
            {activeTab === 'matches' && (
              <div>
                {Object.entries(matchGroups).map(([dayName, matches]) => {
                  const dayDone = matches.filter(m => m.status === 'completed').length
                  return (
                    <div key={dayName} style={{ marginBottom: 20 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: 10, padding: '10px 14px', borderRadius: 10,
                        background: dayDone === matches.length ? 'rgba(0,200,120,0.08)' : 'rgba(255,185,87,0.08)',
                        border: `1px solid ${dayDone === matches.length ? 'rgba(0,200,120,0.2)' : 'rgba(255,185,87,0.2)'}`
                      }}>
                        <div>
                          <span style={{ fontSize: 15, fontWeight: 800, color: dayDone === matches.length ? 'var(--green)' : '#ffb957' }}>{dayName}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 10 }}>Let the battle begin!</span>
                        </div>
                        <span style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 99,
                          background: dayDone === matches.length ? 'rgba(0,200,120,0.12)' : 'var(--bg-surface)',
                          color: dayDone === matches.length ? 'var(--green)' : 'var(--text-muted)',
                          fontWeight: 600
                        }}>{dayDone}/{matches.length}</span>
                      </div>
                      {matches.map(m => (
                        <div key={m.id} style={{ marginBottom: 10, paddingLeft: 14, borderLeft: '2px solid var(--border)', marginLeft: 10 }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                            Match {m.match_number} — {getGroupPairName(m.pod_a_name, m.pod_b_name)}{m.map && ` on ${m.map}`}
                          </div>
                          <MatchCard match={m} />
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ─── FINALIZED BANNER ─── */}
            {detail.status === 'completed' && (
              <div style={{
                background: 'rgba(0,200,120,0.08)', border: '1px solid rgba(0,200,120,0.25)',
                borderRadius: 12, padding: 16, textAlign: 'center', marginTop: 20
              }}>
                <FiAward style={{ fontSize: 24, color: 'var(--green)', marginBottom: 6 }} />
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--green)' }}>Round Robin Finalized!</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Final standings are locked. Congratulations to the winners!
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  )
}

export default CrossPodStandings
