import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FiCheckCircle, FiCircle, FiStar, FiKey, FiAward, FiTarget, FiMonitor, FiArrowLeft, FiLock, FiZap, FiShield } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { SkeletonTable, SkeletonText, SkeletonBlock, SkeletonButton } from "../components/Skeleton"
import "./StageStandings.css"

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
          <thead>
            <tr><th>#</th><th>Team</th><th>M</th><th>Kills</th><th>Points</th></tr>
          </thead>
          <tbody>
            {standings.map(s => (
              <tr key={s.registration_id} className={s.rank <= (advanceCount || 0) ? "advancing" : ""}>
                <td>{s.rank}</td>
                <td>{s.name}</td>
                <td>{s.matches_played}</td>
                <td>{s.total_kills}</td>
                <td className="points-cell">{s.total_points}</td>
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
                  <span className="match-tag done">
                    Results in{m.mvp && <><FiStar /> {m.mvp.name} ({m.mvp.kills} kills)</>}
                  </span>
                ) : m.room_id ? (
                  <span className="match-tag live"><FiKey /> Room live</span>
                ) : (
                  <span className="match-tag pending">Upcoming</span>
                )}
              </div>
              {m.room_id && m.status !== 'completed' && (
                <div className="match-room-details">
                  <div>
                    <span className="mrd-label">Room ID</span>
                    <span className="mrd-value">{m.room_id}</span>
                  </div>
                  <div>
                    <span className="mrd-label">Password</span>
                    <span className="mrd-value">{m.room_password}</span>
                  </div>
                  {m.match_start_time && (
                    <div>
                      <span className="mrd-label">Starts</span>
                      <span className="mrd-value">{new Date(m.match_start_time).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StageView({ stageSummary }) {
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    API.get(`/stages/${stageSummary.id}`).then(res => setDetail(res.data))
  }, [stageSummary.id])

  return (
    <div className="stage-block">
      <div className="stage-block-header">
        <h2>{stageSummary.name} {stageSummary.is_final && <span className="badge badge-purple">FINAL</span>}</h2>
        <span className={`stage-status ${stageSummary.status}`}>
          {stageSummary.status === "completed" ? <><FiCheckCircle /> Completed</> : <><FiCircle style={{color:'var(--green)'}} /> Live</>}
        </span>
      </div>
      {detail?.pods?.map(p => (
        <PodView key={p.id} podSummary={p} advanceCount={stageSummary.advance_count} />
      ))}
    </div>
  )
}

function StatTable({ columns, rows, emptyText }) {
  return (
    <div className="standings-table-wrap">
      <table className="standings-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
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

function StageStandings() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [stages, setStages] = useState([])
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState("stages")
  const [statTab, setStatTab] = useState("overall")
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, min: 0, sec: 0 })

  useEffect(() => {
    if (!tournament?.scheduled_time) return
    const tick = () => {
      const diff = new Date(tournament.scheduled_time).getTime() - Date.now()
      if (diff <= 0) { setCountdown({ days: 0, hrs: 0, min: 0, sec: 0 }); return }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hrs: Math.floor((diff / 3600000) % 24),
        min: Math.floor((diff / 60000) % 60),
        sec: Math.floor((diff / 1000) % 60),
      })
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
    ])
      .then(([tRes, sRes, stRes]) => {
        setTournament(tRes.data)
        setStages(Array.isArray(sRes.data) ? sRes.data : [])
        setStats(stRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="standings-page">
          <SkeletonText width="150px" height={14} style={{ marginBottom: 8 }} />
          <SkeletonText width="300px" height={28} style={{ marginBottom: 16 }} />
          <div className="page-tabs" style={{ marginBottom: 24 }}>
            <SkeletonButton width={100} height={40} style={{ marginRight: 12 }} />
            <SkeletonButton width={140} height={40} />
          </div>
          <SkeletonTable rows={6} cols={5} />
          <SkeletonBlock height={120} style={{ borderRadius: 16, marginTop: 24 }} />
        </div>
      </>
    )
  }

  const statTabs = [
    { key: "overall", label: "Overall", Icon: FiAward },
    { key: "team_frags", label: "Team Frags", Icon: FiTarget },
    { key: "individual_frags", label: "Individual Frags", Icon: FiTarget },
    { key: "mvp_leaderboard", label: "MVPs", Icon: FiStar },
  ]

  const renderStatTable = () => {
    if (!stats) return null
    switch (statTab) {
      case "overall":
        return <StatTable rows={stats.overall_leaderboard} columns={[
          { key: "rank", label: "#" }, { key: "name", label: "Team" }, { key: "matches_played", label: "M" },
          { key: "total_kills", label: "Kills" }, { key: "total_points", label: "Points" }
        ]} />
      case "team_frags":
        return <StatTable rows={stats.team_frags} columns={[
          { key: "rank", label: "#" }, { key: "name", label: "Team" }, { key: "total_kills", label: "Total Kills" }
        ]} />
      case "individual_frags":
        return <StatTable rows={stats.individual_frags} columns={[
          { key: "rank", label: "#" }, { key: "name", label: "Player" }, { key: "team_name", label: "Team" }, { key: "total_kills", label: "Kills" }
        ]} />
      case "mvp_leaderboard":
        return <StatTable rows={stats.mvp_leaderboard} columns={[
          { key: "rank", label: "#" }, { key: "name", label: "Player" }, { key: "team_name", label: "Team" }, { key: "count", label: "MVP Awards" }
        ]} />
      default:
        return null
    }
  }

  return (
    <>
      <Navbar />
      <div className="standings-page">
        <div className="standings-back" onClick={() => navigate(`/tournament/${id}`)}><FiArrowLeft /> Back to Tournament</div>

        {tournament && (
          <>
            <h1 className="standings-title">{tournament.name}</h1>
            <p className="standings-subtitle"><FiMonitor /> {tournament.game} — Full Tournament Standings</p>
          </>
        )}

        <div className="page-tabs">
          <span className={tab === "stages" ? "page-tab active" : "page-tab"} onClick={() => setTab("stages")}>By Stage</span>
          <span className={tab === "stats" ? "page-tab active" : "page-tab"} onClick={() => setTab("stats")}>Tournament Stats</span>
        </div>

        {tab === "stages" && (
          stages.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
              padding: '48px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4)' }} />

              {/* Status badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px',
                background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--cyan)',
                letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)' }} />
                Upcoming
              </div>

              {/* Animated icon */}
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.08))',
                border: '1px solid rgba(124,58,237,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 36,
              }}>
                <FiZap style={{ color: 'var(--purple-light)' }} />
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
                color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                Battlefield Preparing
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.6 }}>
                The tournament stages are being prepared. Matchups & standings will appear here once the admin starts the tournament.
              </p>

              {/* Countdown */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 36,
              }}>
                {[
                  { val: countdown.days, label: 'DAYS' },
                  { val: countdown.hrs, label: 'HRS' },
                  { val: countdown.min, label: 'MIN' },
                  { val: countdown.sec, label: 'SEC' },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 800,
                      color: 'var(--cyan)', minWidth: 64, padding: '12px 8px',
                      background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
                      borderRadius: 12, letterSpacing: 2,
                    }}>
                      {String(item.val).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontWeight: 600, letterSpacing: 1 }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tournament Journey */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '24px 20px', maxWidth: 440, margin: '0 auto',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>
                  Tournament Journey
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                  {/* Step 1 - Registration */}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 8px', color: 'var(--green)',
                    }}>
                      <FiCheckCircle size={20} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>Registration</div>
                  </div>

                  {/* Connector 1 */}
                  <div style={{ width: 40, height: 2, background: 'var(--border)', marginBottom: 24 }} />

                  {/* Step 2 - Stages */}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 8px', color: 'var(--gold)',
                    }}>
                      <FiLock size={20} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>Stages</div>
                  </div>

                  {/* Connector 2 */}
                  <div style={{ width: 40, height: 2, background: 'var(--border)', marginBottom: 24 }} />

                  {/* Step 3 - Finals */}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 8px', color: 'var(--purple-light)',
                    }}>
                      <FiAward size={20} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple-light)' }}>Finals</div>
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 20 }}>
                Your battlefield awaits. <FiTarget size={13} style={{ verticalAlign: 'middle' }} />
              </p>
            </div>
          ) : (
            [...stages].reverse().map(s => <StageView key={s.id} stageSummary={s} />)
          )
        )}

        {tab === "stats" && (
          <div className="stage-block">
            <div className="stat-tabs">
              {statTabs.map(t => (
                <span key={t.key} className={statTab === t.key ? "stat-tab active" : "stat-tab"} onClick={() => setStatTab(t.key)}>
                  <t.Icon /> {t.label}
                </span>
              ))}
            </div>
            {renderStatTable()}
          </div>
        )}
      </div>
    </>
  )
}

export default StageStandings
