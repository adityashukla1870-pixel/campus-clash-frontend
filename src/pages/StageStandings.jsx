import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FiCheckCircle, FiCircle, FiStar, FiKey, FiAward, FiTarget, FiMonitor, FiArrowLeft, FiLock, FiZap, FiChevronDown, FiChevronUp, FiArrowRight } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { SkeletonTable, SkeletonText, SkeletonBlock, SkeletonButton } from "../components/Skeleton"
import "./StageStandings.css"

/* ─── Pod View (per group) ─── */
function PodView({ podSummary, advanceCount }) {
  const [detail, setDetail] = useState(null)
  const [standings, setStandings] = useState([])

  useEffect(() => {
    API.get(`/stages/pods/${podSummary.id}`).then(res => setDetail(res.data))
    API.get(`/stages/pods/${podSummary.id}/standings`).then(res => setStandings(res.data))
  }, [podSummary.id])

  return (
    <div className="pod-block">
      <div className="pod-block-header">
        <h3>{podSummary.name}</h3>
        <span className={`stage-status ${podSummary.status}`}>
          {podSummary.status === "completed" ? <><FiCheckCircle /> Done</> : <><FiCircle style={{color:'var(--green)'}} /> Live</>}
        </span>
      </div>
      <div className="standings-table-wrap">
        <table className="standings-table">
          <thead><tr><th>#</th><th>Team</th><th>M</th><th>Kills</th><th>Points</th></tr></thead>
          <tbody>
            {standings.map(s => (
              <tr key={s.registration_id} className={s.rank <= (advanceCount || 0) ? "advancing" : ""}>
                <td>{s.rank}</td><td>{s.name}</td><td>{s.matches_played}</td><td>{s.total_kills}</td><td className="points-cell">{s.total_points}</td>
              </tr>
            ))}
            {standings.length === 0 && <tr><td colSpan={5} className="standings-empty">No matches played yet</td></tr>}
          </tbody>
        </table>
      </div>
      {detail?.matches?.length > 0 && (
        <div className="match-list">
          {detail.matches.map(m => (
            <div key={m.id} className={`match-row-wrap${m.room_id && m.status !== 'completed' ? ' has-room' : ''}`}>
              <div className="match-row">
                <span className="match-label">Match {m.match_number}{m.map && ` · ${m.map}`}</span>
                {m.status === "completed" ? (
                  <span className="match-tag done">Results in{m.mvp && <><FiStar /> {m.mvp.name} ({m.mvp.kills} kills)</>}</span>
                ) : m.room_id ? (
                  <span className="match-tag live"><FiKey /> Room live</span>
                ) : (
                  <span className="match-tag pending">Upcoming</span>
                )}
              </div>
              {m.room_id && m.status !== 'completed' && (
                <div className="match-room-details">
                  <div><span className="mrd-label">Room ID</span><span className="mrd-value">{m.room_id}</span></div>
                  <div><span className="mrd-label">Password</span><span className="mrd-value">{m.room_password}</span></div>
                  {m.match_start_time && <div><span className="mrd-label">Starts</span><span className="mrd-value">{new Date(m.match_start_time).toLocaleString()}</span></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Stage View ─── */
function StageView({ stageSummary }) {
  const [detail, setDetail] = useState(null)
  useEffect(() => { API.get(`/stages/${stageSummary.id}`).then(res => setDetail(res.data)) }, [stageSummary.id])
  return (
    <div className="stage-block">
      <div className="stage-block-header">
        <h2>{stageSummary.name} {stageSummary.is_final && <span className="badge badge-purple">FINAL</span>}</h2>
        <span className={`stage-status ${stageSummary.status}`}>
          {stageSummary.status === "completed" ? <><FiCheckCircle /> Completed</> : <><FiCircle style={{color:'var(--green)'}} /> Live</>}
        </span>
      </div>
      {detail?.pods?.map(p => <PodView key={p.id} podSummary={p} advanceCount={stageSummary.advance_count} />)}
    </div>
  )
}

/* ─── Stat Table ─── */
function StatTable({ columns, rows }) {
  return (
    <div className="standings-table-wrap">
      <table className="standings-table">
        <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{columns.map(c => <td key={c.key} className={c.key === 'total_points' ? 'points-cell' : ''}>{r[c.key]}</td>)}</tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={columns.length} className="standings-empty">No data yet</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

/* ─── How It Works (cross-pod) ─── */
function HowItWorks() {
  const steps = [
    { icon: <FiTarget />, title: "3 Groups", desc: "15 teams split into Group A, B, C (5 each)" },
    { icon: <FiZap />, title: "9 Matches", desc: "Each group plays the other 2 — 3 matches per pairing" },
    { icon: <FiAward />, title: "Overall Winner", desc: "All teams ranked together. Top 3 win!" },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 20, color: 'var(--gold)', marginBottom: 4 }}>{s.icon}</div>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{s.title}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── Podium Card ─── */
function PodiumCard({ team, rank }) {
  const medals = ['🥇', '🥈', '🥉']
  const borders = ['var(--gold)', '#c0c0c0', '#cd7f32']
  return (
    <div style={{
      flex: 1, minWidth: 120, background: 'var(--bg-surface)', border: `2px solid ${borders[rank]}`,
      borderRadius: 14, padding: '16px 10px', textAlign: 'center',
      order: rank === 0 ? 1 : rank === 1 ? 0 : 2
    }}>
      <div style={{ fontSize: 30, marginBottom: 2 }}>{medals[rank]}</div>
      <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2, marginBottom: 2 }}>{team.name}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>{team.pod_name}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{team.total_points}</div>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{team.total_kills} kills · {team.matches_played} matches</div>
    </div>
  )
}

/* ─── Cross-Pod Match Card ─── */
function CrossPodMatchCard({ match }) {
  const isLive = !!match.room_id && match.status !== 'completed'
  const isDone = match.status === 'completed'
  const st = isDone ? { bg: 'rgba(0,200,120,0.1)', color: 'var(--green)', label: 'Done' }
    : isLive ? { bg: 'rgba(0,180,255,0.1)', color: 'var(--cyan)', label: 'Live' }
    : { bg: 'var(--bg-surface)', color: 'var(--text-muted)', label: 'Upcoming' }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 8,
      borderColor: isLive ? 'var(--cyan)' : isDone ? 'rgba(0,200,120,0.3)' : 'var(--border)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{match.pod_a_name}</span>
          <span style={{ background: 'var(--bg-surface)', borderRadius: 4, padding: '1px 6px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>VS</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{match.pod_b_name}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: st.bg, color: st.color }}>{st.label}</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Match {match.match_number}{match.map && ` · ${match.map}`}</div>

      {isLive && (
        <div style={{ background: 'rgba(0,180,255,0.06)', border: '1px solid rgba(0,180,255,0.2)', borderRadius: 6, padding: '8px 10px', marginBottom: 4 }}>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--cyan)', marginBottom: 4, fontWeight: 600 }}><FiKey /> Room Details</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>ROOM ID</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--cyan)' }}>{match.room_id}</div></div>
            <div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>PASSWORD</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--cyan)' }}>{match.room_password}</div></div>
            {match.match_start_time && <div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>STARTS</div><div style={{ fontSize: 12, fontWeight: 600 }}>{new Date(match.match_start_time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div>}
          </div>
        </div>
      )}

      {isDone && (
        <div>
          {match.mvp && <div style={{ fontSize: 10, color: 'var(--gold)', marginBottom: 2, fontWeight: 600 }}><FiStar /> MVP: {match.mvp.name} ({match.mvp.kills}k)</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {[...match.results].sort((a, b) => a.placement - b.placement).map(r => (
              <span key={r.registration_id} style={{ fontSize: 10, background: 'var(--bg-surface)', borderRadius: 4, padding: '2px 6px', color: 'var(--text-secondary)' }}>
                #{r.placement} {r.name} <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{r.points}pts</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── MAIN PAGE ─── */
function StageStandings() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [stages, setStages] = useState([])
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState("rr")
  const [statTab, setStatTab] = useState("overall")
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, min: 0, sec: 0 })

  // Cross-pod state
  const [rrDetail, setRrDetail] = useState(null)
  const [rrStandings, setRrStandings] = useState([])
  const [showGroups, setShowGroups] = useState(false)

  useEffect(() => {
    if (!tournament?.scheduled_time) return
    const tick = () => {
      const diff = new Date(tournament.scheduled_time).getTime() - Date.now()
      if (diff <= 0) { setCountdown({ days: 0, hrs: 0, min: 0, sec: 0 }); return }
      setCountdown({ days: Math.floor(diff / 86400000), hrs: Math.floor((diff / 3600000) % 24), min: Math.floor((diff / 60000) % 60), sec: Math.floor((diff / 1000) % 60) })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [tournament])

  useEffect(() => {
    Promise.all([
      API.get(`/tournament/${id}`),
      API.get(`/stages/tournament/${id}`),
      API.get(`/stages/tournament/${id}/stats`),
      API.get(`/cross-pod/tournament/${id}`),
    ])
      .then(([tRes, sRes, stRes, rrRes]) => {
        setTournament(tRes.data)
        setStages(Array.isArray(sRes.data) ? sRes.data : [])
        setStats(stRes.data)
        if (rrRes.data.length > 0) {
          const latest = rrRes.data[0]
          Promise.all([
            API.get(`/cross-pod/${latest.id}`),
            API.get(`/cross-pod/${latest.id}/standings`)
          ]).then(([dRes, sRes]) => { setRrDetail(dRes.data); setRrStandings(sRes.data) })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  // Auto-refresh for live matches
  useEffect(() => {
    if (!rrDetail?.id || !rrDetail?.matches?.some(m => m.room_id && m.status !== 'completed')) return
    const iv = setInterval(() => {
      API.get(`/cross-pod/${rrDetail.id}`).then(r => setRrDetail(r.data))
      API.get(`/cross-pod/${rrDetail.id}/standings`).then(r => setRrStandings(r.data))
    }, 30000)
    return () => clearInterval(iv)
  }, [rrDetail?.id])

  // Group matches
  const matchGroups = {}
  rrDetail?.matches?.forEach(m => {
    const key = [m.pod_a_name, m.pod_b_name].sort().join(" vs ")
    if (!matchGroups[key]) matchGroups[key] = []
    matchGroups[key].push(m)
  })
  const groupStandings = {}
  rrStandings.forEach(s => {
    if (!groupStandings[s.pod_name]) groupStandings[s.pod_name] = []
    groupStandings[s.pod_name].push(s)
  })
  const matchesDone = rrDetail?.matches?.filter(m => m.status === 'completed').length || 0
  const matchesTotal = rrDetail?.matches?.length || 0
  const liveMatch = rrDetail?.matches?.find(m => m.room_id && m.status !== 'completed')
  const pct = matchesTotal > 0 ? (matchesDone / matchesTotal) * 100 : 0

  const statTabs = [
    { key: "overall", label: "Overall", Icon: FiAward },
    { key: "team_frags", label: "Team Frags", Icon: FiTarget },
    { key: "individual_frags", label: "Individual Frags", Icon: FiTarget },
    { key: "mvp_leaderboard", label: "MVPs", Icon: FiStar },
  ]

  const renderStatTable = () => {
    if (!stats) return null
    switch (statTab) {
      case "overall": return <StatTable rows={stats.overall_leaderboard} columns={[{ key: "rank", label: "#" }, { key: "name", label: "Team" }, { key: "matches_played", label: "M" }, { key: "total_kills", label: "Kills" }, { key: "total_points", label: "Points" }]} />
      case "team_frags": return <StatTable rows={stats.team_frags} columns={[{ key: "rank", label: "#" }, { key: "name", label: "Team" }, { key: "total_kills", label: "Total Kills" }]} />
      case "individual_frags": return <StatTable rows={stats.individual_frags} columns={[{ key: "rank", label: "#" }, { key: "name", label: "Player" }, { key: "team_name", label: "Team" }, { key: "total_kills", label: "Kills" }]} />
      case "mvp_leaderboard": return <StatTable rows={stats.mvp_leaderboard} columns={[{ key: "rank", label: "#" }, { key: "name", label: "Player" }, { key: "team_name", label: "Team" }, { key: "count", label: "MVP Awards" }]} />
      default: return null
    }
  }

  const hasRR = rrDetail && rrStandings.length > 0

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="standings-page">
          <SkeletonText width="150px" height={14} style={{ marginBottom: 8 }} />
          <SkeletonText width="300px" height={28} style={{ marginBottom: 16 }} />
          <div className="page-tabs" style={{ marginBottom: 24 }}><SkeletonButton width={100} height={40} style={{ marginRight: 12 }} /><SkeletonButton width={140} height={40} /></div>
          <SkeletonTable rows={6} cols={5} />
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="standings-page">
        <div className="standings-back" onClick={() => navigate(`/tournament/${id}`)}><FiArrowLeft /> Back to Tournament</div>

        {tournament && (
          <>
            <h1 className="standings-title">{tournament.name}</h1>
            <p className="standings-subtitle"><FiMonitor /> {tournament.game} — Tournament Standings</p>
          </>
        )}

        {/* ─── TABS ─── */}
        <div className="page-tabs">
          {hasRR && <span className={tab === "rr" ? "page-tab active" : "page-tab"} onClick={() => setTab("rr")}>🏆 Round Robin</span>}
          <span className={tab === "stages" ? "page-tab active" : "page-tab"} onClick={() => setTab("stages")}>By Stage</span>
          <span className={tab === "stats" ? "page-tab active" : "page-tab"} onClick={() => setTab("stats")}>Tournament Stats</span>
        </div>

        {/* ═══════ TAB: ROUND ROBIN ═══════ */}
        {tab === "rr" && hasRR && (
          <>
            {/* How it works */}
            <HowItWorks />

            {/* Progress */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>Match Progress</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{matchesDone} / {matchesTotal} completed</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-surface)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: pct === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--purple), var(--cyan))', transition: 'width 0.4s' }} />
                </div>
              </div>
              {pct === 100 && <FiCheckCircle style={{ color: 'var(--green)', fontSize: 18 }} />}
            </div>

            {/* Live alert */}
            {liveMatch && (
              <div style={{ background: 'rgba(0,180,255,0.08)', border: '1px solid rgba(0,180,255,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: 12 }}><strong style={{ color: 'var(--cyan)' }}>LIVE: </strong>{liveMatch.pod_a_name} vs {liveMatch.pod_b_name} — Match {liveMatch.match_number}</span>
              </div>
            )}

            {/* Podium */}
            {rrStandings.length >= 3 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                <PodiumCard team={rrStandings[1]} rank={1} />
                <PodiumCard team={rrStandings[0]} rank={0} />
                <PodiumCard team={rrStandings[2]} rank={2} />
              </div>
            )}

            {/* Overall leaderboard */}
            <div className="stage-block">
              <div className="stage-block-header">
                <h2><FiAward style={{ color: 'var(--gold)' }} /> Overall Rankings</h2>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>All Groups Combined</span>
              </div>
              <div className="standings-table-wrap">
                <table className="standings-table">
                  <thead><tr><th>#</th><th>Team</th><th>Group</th><th>M</th><th>Wins</th><th>Kills</th><th>Pts</th></tr></thead>
                  <tbody>
                    {rrStandings.map((s, i) => (
                      <tr key={s.registration_id} style={i < 3 ? { background: 'rgba(212,175,55,0.06)' } : {}}>
                        <td style={{ fontWeight: i < 3 ? 700 : 400 }}>{i < 3 ? ['🥇','🥈','🥉'][i] : s.rank}</td>
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

            {/* Matches */}
            <div className="stage-block" style={{ marginTop: 14 }}>
              <div className="stage-block-header"><h2>Matches</h2></div>
              {Object.entries(matchGroups).map(([pairName, matches]) => {
                const pairDone = matches.filter(m => m.status === 'completed').length
                return (
                  <div key={pairName} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{pairName}</span>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: pairDone === matches.length ? 'rgba(0,200,120,0.12)' : 'var(--bg-surface)', color: pairDone === matches.length ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>{pairDone}/{matches.length}</span>
                    </div>
                    {matches.map(m => <CrossPodMatchCard key={m.id} match={m} />)}
                  </div>
                )
              })}
            </div>

            {/* Group-wise */}
            {Object.keys(groupStandings).length > 0 && (
              <div style={{ marginTop: 14 }}>
                <button onClick={() => setShowGroups(!showGroups)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '8px 0' }}>
                  {showGroups ? <FiChevronUp /> : <FiChevronDown />} View Group-wise Standings
                </button>
                {showGroups && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 8 }}>
                    {Object.entries(groupStandings).map(([groupName, teams]) => (
                      <div key={groupName} className="pod-block">
                        <div className="pod-block-header"><h3>{groupName}</h3><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{teams.length} teams</span></div>
                        <table className="standings-table" style={{ fontSize: 11 }}>
                          <thead><tr><th>#</th><th>Team</th><th>M</th><th>Kills</th><th>Pts</th></tr></thead>
                          <tbody>{teams.map(s => <tr key={s.registration_id}><td>{s.rank}</td><td>{s.name}</td><td>{s.matches_played}</td><td>{s.total_kills}</td><td className="points-cell">{s.total_points}</td></tr>)}</tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {rrDetail.status === 'completed' && (
              <div style={{ background: 'rgba(0,200,120,0.08)', border: '1px solid rgba(0,200,120,0.25)', borderRadius: 10, padding: 14, textAlign: 'center', marginTop: 14 }}>
                <FiAward style={{ fontSize: 20, color: 'var(--green)', marginBottom: 4 }} />
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--green)' }}>Round Robin Finalized!</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Final standings locked. Congratulations to the winners!</div>
              </div>
            )}
          </>
        )}

        {/* ═══════ TAB: STAGES ═══════ */}
        {tab === "stages" && (
          stages.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
              <FiZap style={{ fontSize: 36, color: 'var(--purple-light)', marginBottom: 12 }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 6 }}>Battlefield Preparing</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 340, margin: '0 auto 20px' }}>Matchups & standings will appear here once the admin starts the tournament.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                {[{ val: countdown.days, label: 'DAYS' }, { val: countdown.hrs, label: 'HRS' }, { val: countdown.min, label: 'MIN' }, { val: countdown.sec, label: 'SEC' }].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, color: 'var(--cyan)', minWidth: 56, padding: '10px 6px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 10 }}>
                      {String(item.val).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : [...stages].reverse().map(s => <StageView key={s.id} stageSummary={s} />)
        )}

        {/* ═══════ TAB: STATS ═══════ */}
        {tab === "stats" && (
          <div className="stage-block">
            <div className="stat-tabs">
              {statTabs.map(t => (
                <span key={t.key} className={statTab === t.key ? "stat-tab active" : "stat-tab"} onClick={() => setStatTab(t.key)}><t.Icon /> {t.label}</span>
              ))}
            </div>
            {renderStatTable()}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </>
  )
}

export default StageStandings
