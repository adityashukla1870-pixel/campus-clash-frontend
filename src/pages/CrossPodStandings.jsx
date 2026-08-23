import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { FiCheckCircle, FiCircle, FiStar, FiKey, FiArrowRight, FiArrowLeft, FiTarget } from "react-icons/fi"
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
          <span style={{ marginLeft: 6, opacity: 0.6 }}>Match {match.match_number}</span>
        </span>
        {match.status === "completed" ? (
          <span className="match-tag done">
            Results in{match.mvp && <><FiStar /> {match.mvp.name} ({match.mvp.kills} kills)</>}
          </span>
        ) : match.room_id ? (
          <span className="match-tag live"><FiKey /> Room live</span>
        ) : (
          <span className="match-tag pending">Upcoming</span>
        )}
      </div>
      {match.room_id && match.status !== 'completed' && (
        <div className="match-room-details">
          <div>
            <span className="mrd-label">Room ID</span>
            <span className="mrd-value">{match.room_id}</span>
          </div>
          <div>
            <span className="mrd-label">Password</span>
            <span className="mrd-value">{match.room_password}</span>
          </div>
          {match.match_start_time && (
            <div>
              <span className="mrd-label">Starts</span>
              <span className="mrd-value">{new Date(match.match_start_time).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
      {match.status === 'completed' && match.results?.length > 0 && (
        <div style={{ padding: '6px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
          {[...match.results].sort((a, b) => a.placement - b.placement).map(r => (
            <span key={r.registration_id} style={{ marginRight: 10 }}>
              #{r.placement} {r.name} ({r.kills}k, {r.points}pts)
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function RoundRobinView({ rr }) {
  const [detail, setDetail] = useState(null)
  const [standings, setStandings] = useState([])

  useEffect(() => {
    API.get(`/cross-pod/${rr.id}`).then(res => setDetail(res.data))
    API.get(`/cross-pod/${rr.id}/standings`).then(res => setStandings(res.data))
  }, [rr.id])

  return (
    <div className="stage-block">
      <div className="stage-block-header">
        <h2>{rr.name}</h2>
        <span className={`stage-status ${rr.status}`}>
          {rr.status === "completed" ? <><FiCheckCircle /> Done</> : <><FiCircle style={{ color: 'var(--green)' }} /> Live</>}
        </span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
        {rr.pods?.length} groups · {rr.matches_per_pair} match{rr.matches_per_pair !== 1 ? 'es' : ''} per pair · {detail?.matches?.length || 0} total matches
      </p>

      {/* Standings */}
      <div className="standings-table-wrap">
        <table className="standings-table">
          <thead>
            <tr><th>#</th><th>Team</th><th>Group</th><th>M</th><th>Kills</th><th>Points</th></tr>
          </thead>
          <tbody>
            {standings.map(s => (
              <tr key={s.registration_id}>
                <td>{s.rank}</td>
                <td>{s.name}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.pod_name}</td>
                <td>{s.matches_played}</td>
                <td>{s.total_kills}</td>
                <td className="points-cell">{s.total_points}</td>
              </tr>
            ))}
            {standings.length === 0 && <tr><td colSpan={6} className="standings-empty">No matches played yet</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Matches */}
      {detail?.matches?.length > 0 && (
        <div className="match-list" style={{ marginTop: 14 }}>
          {detail.matches.map(m => (
            <CrossPodMatchView key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  )
}

function CrossPodStandings() {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [roundRobins, setRoundRobins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      API.get(`/tournament/${id}`),
      API.get(`/cross-pod/tournament/${id}`)
    ]).then(([tRes, rrRes]) => {
      setTournament(tRes.data)
      setRoundRobins(rrRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '40px 24px', maxWidth: 820, margin: '0 auto' }}>
          <SkeletonText width="220px" height={28} style={{ marginBottom: 20 }} />
          <SkeletonBlock height={180} style={{ borderRadius: 16, marginBottom: 20 }} />
          <SkeletonTable rows={5} cols={5} />
        </div>
      </>
    )
  }

  if (!tournament) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Tournament not found.
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: '40px 24px 60px', maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiTarget /> {tournament.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
          Cross-Pod Round Robin Standings
        </p>

        {roundRobins.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>
            No round-robin matches scheduled yet. Stay tuned!
          </div>
        ) : (
          [...roundRobins].reverse().map(rr => (
            <RoundRobinView key={rr.id} rr={rr} />
          ))
        )}
      </div>
    </>
  )
}

export default CrossPodStandings
