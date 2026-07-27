import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import "./StageStandings.css"

function StageView({ stageSummary }) {
  const [detail, setDetail] = useState(null)
  const [standings, setStandings] = useState([])

  useEffect(() => {
    API.get(`/stages/${stageSummary.id}`).then(res => setDetail(res.data))
    API.get(`/stages/${stageSummary.id}/standings`).then(res => setStandings(res.data))
  }, [stageSummary.id])

  return (
    <div className="stage-block">
      <div className="stage-block-header">
        <h2>{stageSummary.name} {stageSummary.is_final && <span className="badge badge-purple">FINAL</span>}</h2>
        <span className={`stage-status ${stageSummary.status}`}>
          {stageSummary.status === "completed" ? "✅ Completed" : "🟢 Live"}
        </span>
      </div>

      <div className="standings-table-wrap">
        <table className="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Matches</th>
              <th>Kills</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(s => (
              <tr key={s.registration_id} className={s.rank <= (stageSummary.advance_count || 0) ? "advancing" : ""}>
                <td>{s.rank}</td>
                <td>{s.name}</td>
                <td>{s.matches_played}</td>
                <td>{s.total_kills}</td>
                <td className="points-cell">{s.total_points}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr><td colSpan={5} className="standings-empty">No matches played yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detail?.matches?.length > 0 && (
        <div className="match-list">
          {detail.matches.map(m => (
            <div key={m.id} className="match-row">
              <span className="match-label">Match {m.match_number}{m.map && ` · ${m.map}`}</span>
              {m.status === "completed" ? (
                <span className="match-tag done">Results in</span>
              ) : m.room_id ? (
                <span className="match-tag live">Room live</span>
              ) : (
                <span className="match-tag pending">Upcoming</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StageStandings() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [stages, setStages] = useState([])

  useEffect(() => {
    API.get(`/tournament/${id}`).then(res => setTournament(res.data)).catch(() => {})
    API.get(`/stages/tournament/${id}`).then(res => setStages(res.data)).catch(() => {})
  }, [id])

  return (
    <>
      <Navbar />
      <div className="standings-page">
        <div className="standings-back" onClick={() => navigate(`/tournament/${id}`)}>← Back to Tournament</div>

        {tournament && (
          <>
            <h1 className="standings-title">{tournament.name}</h1>
            <p className="standings-subtitle">🎮 {tournament.game} — Full Tournament Standings</p>
          </>
        )}

        {stages.length === 0 ? (
          <div className="stage-block">
            <p className="standings-empty">Stages haven't started yet — check back once the admin kicks things off.</p>
          </div>
        ) : (
          [...stages].reverse().map(s => <StageView key={s.id} stageSummary={s} />)
        )}
      </div>
    </>
  )
}

export default StageStandings
