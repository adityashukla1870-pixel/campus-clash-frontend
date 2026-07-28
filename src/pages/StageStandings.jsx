import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"
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
          {podSummary.status === "completed" ? "✅ Done" : "🟢 Live"}
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
                    Results in{m.mvp && ` · ⭐ ${m.mvp.name} (${m.mvp.kills} kills)`}
                  </span>
                ) : m.room_id ? (
                  <span className="match-tag live">🔑 Room live</span>
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
          {stageSummary.status === "completed" ? "✅ Completed" : "🟢 Live"}
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

  useEffect(() => {
    API.get(`/tournament/${id}`).then(res => setTournament(res.data)).catch(() => {})
    API.get(`/stages/tournament/${id}`).then(res => setStages(res.data)).catch(() => {})
    API.get(`/stages/tournament/${id}/stats`).then(res => setStats(res.data)).catch(() => {})
  }, [id])

  const statTabs = [
    { key: "overall", label: "🏆 Overall" },
    { key: "team_frags", label: "🔫 Team Frags" },
    { key: "individual_frags", label: "🎯 Individual Frags" },
    { key: "chicken_dinners", label: "🍗 Chicken Dinners" },
    { key: "mvp_leaderboard", label: "⭐ MVPs" },
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
      case "chicken_dinners":
        return <StatTable rows={stats.chicken_dinners} columns={[
          { key: "rank", label: "#" }, { key: "name", label: "Team" }, { key: "chicken_dinners", label: "🍗 Wins" }
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
        <div className="standings-back" onClick={() => navigate(`/tournament/${id}`)}>← Back to Tournament</div>

        {tournament && (
          <>
            <h1 className="standings-title">{tournament.name}</h1>
            <p className="standings-subtitle">🎮 {tournament.game} — Full Tournament Standings</p>
          </>
        )}

        <div className="page-tabs">
          <span className={tab === "stages" ? "page-tab active" : "page-tab"} onClick={() => setTab("stages")}>By Stage</span>
          <span className={tab === "stats" ? "page-tab active" : "page-tab"} onClick={() => setTab("stats")}>Tournament Stats</span>
        </div>

        {tab === "stages" && (
          stages.length === 0 ? (
            <div className="stage-block"><p className="standings-empty">Stages haven't started yet — check back once the admin kicks things off.</p></div>
          ) : (
            [...stages].reverse().map(s => <StageView key={s.id} stageSummary={s} />)
          )
        )}

        {tab === "stats" && (
          <div className="stage-block">
            <div className="stat-tabs">
              {statTabs.map(t => (
                <span key={t.key} className={statTab === t.key ? "stat-tab active" : "stat-tab"} onClick={() => setStatTab(t.key)}>
                  {t.label}
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
