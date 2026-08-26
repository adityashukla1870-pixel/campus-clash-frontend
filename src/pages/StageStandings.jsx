import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiCheckCircle, FiCircle, FiStar, FiKey, FiAward, FiTarget, FiMonitor, FiArrowLeft, FiLock, FiZap, FiChevronDown, FiChevronUp, FiArrowRight, FiGrid } from "react-icons/fi"
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
function HowItWorks({ hasFullLobby }) {
  const steps = hasFullLobby ? [
    { icon: <FiTarget />, title: "12 Teams", desc: "All qualified teams compete together" },
    { icon: <FiZap />, title: "9 Matches", desc: "Day 1-2: Group matches · Day 3: Full Lobby" },
    { icon: <FiAward />, title: "Overall Winner", desc: "All teams ranked together. Top 3 win!" },
  ] : [
    { icon: <FiTarget />, title: "3 Groups", desc: "15 teams split into Group A, B, C (5 each)" },
    { icon: <FiZap />, title: "9 Matches", desc: "3 days, 3 matches each — Round Robin format" },
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

/* ─── Podium Card (animated) ─── */
function PodiumCard({ team, rank, delay = 0 }) {
  const medals = ['🥇', '🥈', '🥉']
  const borders = ['var(--gold)', '#c0c0c0', '#cd7f32']
  const glows = ['rgba(212,175,55,0.25)', 'rgba(203,213,225,0.2)', 'rgba(205,127,50,0.2)']
  const blockH = rank === 0 ? 100 : rank === 1 ? 70 : 50

  return (
    <div style={{
      flex: 1, minWidth: 0, maxWidth: 150,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      order: rank === 0 ? 1 : rank === 1 ? 0 : 2
    }}>
      {/* Avatar + name section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 10 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: delay + 0.2 }}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-card))',
            border: `3px solid ${borders[rank]}`,
            boxShadow: `0 0 18px ${glows[rank]}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, position: 'relative'
          }}
        >
          {medals[rank]}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: delay + 0.6 }}
            style={{
              position: 'absolute', top: -4, right: -4,
              width: 20, height: 20, borderRadius: '50%',
              background: borders[rank], display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: rank === 0 ? '#af7c04' : '#333',
              border: '2px solid var(--bg-dark)'
            }}
          >{rank + 1}</motion.span>
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.2 }}>{team.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{team.pod_name}</div>
        </div>
      </motion.div>

      {/* Block section */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: blockH, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', borderRadius: '6px 6px 0 0', position: 'relative', overflow: 'hidden',
          background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-surface) 100%)`,
          boxShadow: `0 -3px 0 0 ${glows[rank]}, inset 0 1px 0 ${glows[rank]}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: borders[rank], opacity: 0.7 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: 'rgba(0,0,0,0.25)' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 4, background: 'rgba(255,255,255,0.03)' }} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: delay + 0.8 }}
          style={{
            background: 'var(--purple-glow)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '3px 10px', fontSize: 14, fontWeight: 700, color: 'var(--gold)'
          }}
        >
          {team.total_points} pts
        </motion.div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 1.0 }}
          style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}
        >
          {team.total_kills} kills · {team.matches_played} matches
        </motion.span>
      </motion.div>
    </div>
  )
}

/* ─── Cross-Pod Match Card ─── */
function CrossPodMatchCard({ match }) {
  const isLive = !!match.room_id && match.status !== 'completed'
  const isDone = match.status === 'completed'
  const isFullLobby = match.full_lobby
  const st = isDone ? { bg: 'rgba(0,200,120,0.1)', color: 'var(--green)', label: 'Done' }
    : isLive ? { bg: 'rgba(0,180,255,0.1)', color: 'var(--cyan)', label: 'Live' }
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
    10: { idRelease: '8:20 PM', matchStart: '8:30 PM' },
    11: { idRelease: '9:00 PM', matchStart: '9:10 PM' },
    12: { idRelease: '9:40 PM', matchStart: '9:50 PM' },
  }
  const timing = defaultTimings[match.match_number]

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 8,
      borderColor: isLive ? 'var(--cyan)' : isDone ? 'rgba(0,200,120,0.3)' : isFullLobby ? 'rgba(255,185,87,0.3)' : 'var(--border)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isFullLobby ? (
            <>
              <span style={{ padding: '2px 8px', borderRadius: 99, background: 'rgba(255,185,87,0.15)', color: '#ffb957', fontWeight: 700, fontSize: 11 }}>FULL LOBBY</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold)' }}>All 12 Teams</span>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{match.pod_a_name}</span>
              <span style={{ background: 'var(--bg-surface)', borderRadius: 4, padding: '1px 6px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>&</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{match.pod_b_name}</span>
            </>
          )}
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: st.bg, color: st.color }}>{st.label}</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        Match {match.match_number}
        {match.map && (
          <>
            <span style={{ padding: '1px 6px', borderRadius: 4, background: isFullLobby ? 'rgba(255,185,87,0.1)' : 'var(--bg-surface)', fontSize: 10, fontWeight: 600 }}>{match.map}</span>
          </>
        )}
      </div>

      {!isDone && !isLive && timing && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
          <div style={{ flex: 1, background: 'rgba(255,185,87,0.08)', border: '1px solid rgba(255,185,87,0.2)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>ID & Password</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffb957' }}>{timing.idRelease}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: 14 }}>»</div>
          <div style={{ flex: 1, background: 'rgba(0,200,120,0.06)', border: '1px solid rgba(0,200,120,0.2)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Match Start</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{timing.matchStart}</div>
          </div>
        </div>
      )}

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

      {match.slot_assignments && Object.keys(match.slot_assignments).length > 0 && (
        <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 6, padding: '8px 10px', marginBottom: 4 }}>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--purple)', marginBottom: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiGrid size={10} /> Lobby Slots
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
            {Object.entries(match.slot_assignments)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([slot, data]) => (
                <div key={slot} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 4, padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {slot}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {data.team_name}
                  </div>
                </div>
              ))}
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
  const [statTab, setStatTab] = useState("team_frags")
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

  // Group matches by Day (Day 1, Day 2, Day 3)
  const getGroupPairName = (nameA, nameB) => {
    if (!nameA || !nameB || nameA === "All Teams") return "Full Lobby"
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
  const hasFullLobby = rrDetail?.matches?.some(m => m.full_lobby)
  rrDetail?.matches?.forEach(m => {
    // Skip old Day 3 group matches when full-lobby matches exist
    if (hasFullLobby && !m.full_lobby && m.match_number > 6) return

    const dayNum = Math.ceil(m.match_number / 3)
    const key = `Day ${dayNum}`
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
    { key: "team_frags", label: "Team Frags", Icon: FiTarget },
    { key: "individual_frags", label: "Individual Frags", Icon: FiTarget },
    { key: "mvp_leaderboard", label: "MVPs", Icon: FiStar },
  ]

  const renderStatTable = () => {
    if (!stats) return null
    switch (statTab) {
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
        <div className="page-tabs" style={{ justifyContent: 'center' }}>
          {hasRR && <span className={tab === "rr" ? "page-tab active" : "page-tab"} onClick={() => setTab("rr")}>🏆 Round Robin</span>}
          <span className={tab === "stats" ? "page-tab active" : "page-tab"} onClick={() => setTab("stats")}>Tournament Stats</span>
        </div>

        {/* ═══════ TAB: ROUND ROBIN ═══════ */}
        {tab === "rr" && hasRR && (
          <>
            {/* How it works */}
            <HowItWorks hasFullLobby={hasFullLobby} />

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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '28px 20px 0', overflow: 'hidden', marginBottom: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
                  <PodiumCard team={rrStandings[1]} rank={1} delay={0.5} />
                  <PodiumCard team={rrStandings[0]} rank={0} delay={0.2} />
                  <PodiumCard team={rrStandings[2]} rank={2} delay={0.7} />
                </div>
              </motion.div>
            )}

            {/* Overall leaderboard */}
            <motion.div
              className="stage-block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
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
            </motion.div>

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

            {/* Matches - Day Wise Schedule */}
            <motion.div
              className="stage-block"
              style={{ marginTop: 14 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <div className="stage-block-header"><h2>Matches</h2></div>
              {Object.entries(matchGroups).map(([dayName, matches]) => {
                const dayDone = matches.filter(m => m.status === 'completed').length
                return (
                  <div key={dayName} style={{ marginBottom: 18 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: 8, padding: '8px 12px', borderRadius: 8,
                      background: dayDone === matches.length ? 'rgba(0,200,120,0.08)' : 'rgba(255,185,87,0.08)',
                      border: `1px solid ${dayDone === matches.length ? 'rgba(0,200,120,0.2)' : 'rgba(255,185,87,0.2)'}`
                    }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: dayDone === matches.length ? 'var(--green)' : '#ffb957' }}>{dayName}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>Let the battle begin!</span>
                      </div>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: dayDone === matches.length ? 'rgba(0,200,120,0.12)' : 'var(--bg-surface)', color: dayDone === matches.length ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>{dayDone}/{matches.length}</span>
                    </div>
                    {matches.map(m => (
                      <div key={m.id} style={{ marginBottom: 6, paddingLeft: 12, borderLeft: '2px solid var(--border)', marginLeft: 8 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>
                          Match {m.match_number} — {getGroupPairName(m.pod_a_name, m.pod_b_name)}{m.map && ` on ${m.map}`}
                        </div>
                        <CrossPodMatchCard match={m} />
                      </div>
                    ))}
                  </div>
                )
              })}
            </motion.div>

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
