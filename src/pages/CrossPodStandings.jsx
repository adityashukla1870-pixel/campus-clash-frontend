import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { FiCheckCircle, FiCircle, FiStar, FiKey, FiArrowRight, FiTarget, FiAward, FiChevronDown, FiChevronUp } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { SkeletonTable, SkeletonText, SkeletonBlock } from "../components/Skeleton"
import "./StageStandings.css"

function CrossPodMatchView({ match }) {
  return (
    <div className={`match-row-wrap${match.room_id && match.status !== 'completed' ? ' has-room' : ''}`}>
      <div className="match-row">
        <span className="match-label">
          {match.pod_a_name} <FiArrowRight style={{ fontSize: 11 }} /> {match.pod_b_name}
          <span style={{ marginLeft: 6, opacity: 0.6 }}>M{match.match_number}</span>
        </span>
        {match.status === "completed" ? (
          <span className="match-tag done">
            Done{match.mvp && <><FiStar /> {mvp_short(match.mvp.name, match.mvp.kills)}</>}
          </span>
        ) : match.room_id ? (
          <span className="match-tag live"><FiKey /> Live</span>
        ) : (
          <span className="match-tag pending">Upcoming</span>
        )}
      </div>
      {match.room_id && match.status !== 'completed' && (
        <div className="match-room-details">
          <div><span className="mrd-label">Room ID</span><span className="mrd-value">{match.room_id}</span></div>
          <div><span className="mrd-label">Password</span><span className="mrd-value">{match.room_password}</span></div>
          {match.match_start_time && (
            <div><span className="mrd-label">Starts</span><span className="mrd-value">{new Date(match.match_start_time).toLocaleString()}</span></div>
          )}
        </div>
      )}
    </div>
  )
}

function mvp_short(name, kills) {
  return `${name} (${kills}k)`
}

function CrossPodStandings() {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [roundRobins, setRoundRobins] = useState([])
  const [detail, setDetail] = useState(null)
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGroups, setShowGroups] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      API.get(`/tournament/${id}`),
      API.get(`/cross-pod/tournament/${id}`)
    ]).then(([tRes, rrRes]) => {
      setTournament(tRes.data)
      setRoundRobins(rrRes.data)
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

  // Group matches by pairing
  const matchGroups = {}
  if (detail?.matches) {
    detail.matches.forEach(m => {
      const key = [m.pod_a_name, m.pod_b_name].sort().join(" vs ")
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

  const medals = ['🥇', '🥈', '🥉']

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '40px 24px', maxWidth: 820, margin: '0 auto' }}>
          <SkeletonText width="220px" height={28} style={{ marginBottom: 20 }} />
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
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>Tournament not found.</div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: '40px 24px 60px', maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiTarget /> {tournament.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
          Cross-Pod Round Robin
        </p>

        {!detail && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>
            Round robin matches haven't been scheduled yet. Stay tuned!
          </div>
        )}

        {detail && (
          <>
            {/* ===== OVERALL LEADERBOARD — MAIN ===== */}
            {standings.length > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiAward style={{ color: 'var(--gold)' }} /> Overall Leaderboard
                </h2>

                {/* Top 3 podium */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                  {standings.slice(0, 3).map((s, i) => (
                    <div key={s.registration_id} style={{
                      flex: 1, minWidth: 140, background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 12, padding: 16, textAlign: 'center',
                      borderColor: i === 0 ? 'var(--gold)' : i === 1 ? '#c0c0c0' : '#cd7f32',
                      order: i === 0 ? 1 : i === 1 ? 0 : 2
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 4 }}>{medals[i]}</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{s.pod_name}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{s.total_points}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {s.total_kills} kills · {s.matches_played} matches
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full standings table */}
                <div className="standings-table-wrap">
                  <table className="standings-table">
                    <thead>
                      <tr><th>#</th><th>Team</th><th>Group</th><th>M</th><th>Chicken</th><th>Kills</th><th>Points</th></tr>
                    </thead>
                    <tbody>
                      {standings.map((s, i) => (
                        <tr key={s.registration_id} style={i < 3 ? { background: 'rgba(212,175,55,0.05)' } : {}}>
                          <td>{s.rank}</td>
                          <td style={{ fontWeight: i < 3 ? 700 : 400 }}>{s.name}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.pod_name}</td>
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
            )}

            {/* ===== MATCHES ===== */}
            {detail.matches?.length > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 14 }}>Matches</h2>
                {Object.entries(matchGroups).map(([pairName, matches]) => (
                  <div key={pairName} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{pairName}</div>
                    <div className="match-list">
                      {matches.map(m => <CrossPodMatchView key={m.id} match={m} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== PER-GROUP LEADERBOARDS — SECONDARY ===== */}
            {Object.keys(groupStandings).length > 0 && (
              <div>
                <button onClick={() => setShowGroups(!showGroups)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, padding: '8px 0', marginBottom: 8 }}>
                  {showGroups ? <FiChevronUp /> : <FiChevronDown />}
                  Group-wise Standings
                </button>
                {showGroups && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {Object.entries(groupStandings).map(([groupName, teams]) => (
                      <div key={groupName} className="pod-block">
                        <div className="pod-block-header">
                          <h3>{groupName}</h3>
                        </div>
                        <div className="standings-table-wrap">
                          <table className="standings-table">
                            <thead>
                              <tr><th>#</th><th>Team</th><th>M</th><th>Kills</th><th>Points</th></tr>
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {detail.status === 'completed' && (
              <div style={{ textAlign: 'center', color: 'var(--green)', padding: 20, fontSize: 15, marginTop: 10 }}>
                <FiAward /> Round Robin Finalized
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default CrossPodStandings
