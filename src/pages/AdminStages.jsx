import { useEffect, useState } from "react"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"

function StageCard({ stage, onChanged }) {
  const [detail, setDetail] = useState(null)
  const [standings, setStandings] = useState([])
  const [newMap, setNewMap] = useState("")
  const [roomDrafts, setRoomDrafts] = useState({})
  const [resultDrafts, setResultDrafts] = useState({})
  const [busy, setBusy] = useState(false)

  const load = () => {
    API.get(`/stages/${stage.id}`).then(res => setDetail(res.data))
    API.get(`/stages/${stage.id}/standings`).then(res => setStandings(res.data))
  }

  useEffect(load, [stage.id])

  const addMatch = async () => {
    setBusy(true)
    try {
      await API.post(`/stages/${stage.id}/matches`, { map: newMap })
      setNewMap("")
      load()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add match")
    } finally {
      setBusy(false)
    }
  }

  const releaseRoom = async (matchId) => {
    const draft = roomDrafts[matchId] || {}
    if (!draft.room_id || !draft.password) { alert("Room ID and password required"); return }
    setBusy(true)
    try {
      await API.post(`/stages/matches/${matchId}/room`, draft)
      load()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to release room")
    } finally {
      setBusy(false)
    }
  }

  const submitResults = async (matchId) => {
    const draft = resultDrafts[matchId] || {}
    const results = stage.participants.map(p => ({
      registration_id: p.registration_id,
      placement: Number(draft[p.registration_id]?.placement || 0),
      kills: Number(draft[p.registration_id]?.kills || 0)
    })).filter(r => r.placement > 0)

    if (results.length === 0) { alert("Enter at least one placement"); return }
    setBusy(true)
    try {
      await API.post(`/stages/matches/${matchId}/results`, { results })
      load()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit results")
    } finally {
      setBusy(false)
    }
  }

  const finalizeStage = async () => {
    const msg = stage.is_final
      ? "Finalize this stage and declare the tournament winner? This can't be undone."
      : `Finalize "${stage.name}" and lock in standings? This can't be undone.`
    if (!confirm(msg)) return
    setBusy(true)
    try {
      await API.post(`/stages/${stage.id}/finalize`)
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to finalize stage")
    } finally {
      setBusy(false)
    }
  }

  const setRoomField = (matchId, field, value) => {
    setRoomDrafts(prev => ({ ...prev, [matchId]: { ...prev[matchId], [field]: value } }))
  }

  const setResultField = (matchId, regId, field, value) => {
    setResultDrafts(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [regId]: { ...prev[matchId]?.[regId], [field]: value } }
    }))
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, display: 'flex', alignItems: 'center', gap: 8 }}>
            {stage.name}
            {stage.is_final && <span className="badge badge-purple">FINAL</span>}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {stage.participants.length} teams · {stage.status === 'completed' ? '✅ Finalized' : '🟢 Active'}
            {stage.advance_count ? ` · Top ${stage.advance_count} advance` : ''}
          </p>
        </div>
        {stage.status === 'active' && (
          <button className="btn-success" disabled={busy} onClick={finalizeStage}>
            {stage.is_final ? '🏆 Finalize & Declare Winner' : '✅ Finalize Stage'}
          </button>
        )}
      </div>

      {/* Standings */}
      <div style={{ marginBottom: 20, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px' }}>#</th>
              <th style={{ padding: '6px 8px' }}>Team</th>
              <th style={{ padding: '6px 8px' }}>Matches</th>
              <th style={{ padding: '6px 8px' }}>Kills</th>
              <th style={{ padding: '6px 8px' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(s => (
              <tr key={s.registration_id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', color: s.rank <= (stage.advance_count || 0) ? 'var(--green)' : 'var(--text-primary)' }}>{s.rank}</td>
                <td style={{ padding: '6px 8px' }}>{s.name}</td>
                <td style={{ padding: '6px 8px' }}>{s.matches_played}</td>
                <td style={{ padding: '6px 8px' }}>{s.total_kills}</td>
                <td style={{ padding: '6px 8px', fontWeight: 700, color: 'var(--gold)' }}>{s.total_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matches */}
      {detail?.matches?.map(m => (
        <div key={m.id} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Match {m.match_number} {m.map && `— ${m.map}`}
            <span style={{ marginLeft: 8, fontSize: 12, color: m.status === 'completed' ? 'var(--green)' : 'var(--text-muted)' }}>
              {m.status === 'completed' ? '✅ Results in' : m.room_id ? '🔑 Room live' : '⏳ Not started'}
            </span>
          </div>

          {!m.room_id && stage.status === 'active' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <input placeholder="Room ID" style={{ flex: 1, minWidth: 100 }} onChange={e => setRoomField(m.id, 'room_id', e.target.value)} />
              <input placeholder="Password" style={{ flex: 1, minWidth: 100 }} onChange={e => setRoomField(m.id, 'password', e.target.value)} />
              <input type="datetime-local" onChange={e => setRoomField(m.id, 'start_time', e.target.value)} />
              <button className="btn-secondary" disabled={busy} onClick={() => releaseRoom(m.id)}>Release</button>
            </div>
          )}

          {m.room_id && m.status !== 'completed' && (
            <div style={{ fontSize: 13, color: 'var(--cyan)', marginBottom: 8 }}>
              Room: {m.room_id} / {m.room_password}
            </div>
          )}

          {m.status !== 'completed' && stage.status === 'active' && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Enter results (placement + kills per team):</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                {stage.participants.map(p => (
                  <div key={p.registration_id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                    <input type="number" placeholder="Rank" style={{ width: 70 }}
                      onChange={e => setResultField(m.id, p.registration_id, 'placement', e.target.value)} />
                    <input type="number" placeholder="Kills" style={{ width: 70 }}
                      onChange={e => setResultField(m.id, p.registration_id, 'kills', e.target.value)} />
                  </div>
                ))}
              </div>
              <button className="btn-primary" disabled={busy} onClick={() => submitResults(m.id)}>Submit Results</button>
            </div>
          )}

          {m.status === 'completed' && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {m.results.sort((a, b) => a.placement - b.placement).map(r => (
                <div key={r.registration_id}>#{r.placement} {r.name} — {r.kills} kills — {r.points} pts</div>
              ))}
            </div>
          )}
        </div>
      ))}

      {stage.status === 'active' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input placeholder="Map (optional)" style={{ flex: 1 }} value={newMap} onChange={e => setNewMap(e.target.value)} />
          <button className="btn-secondary" disabled={busy} onClick={addMatch}>+ Add Match</button>
        </div>
      )}
    </div>
  )
}

function AdminStages() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState("")
  const [stages, setStages] = useState([])
  const [newStageName, setNewStageName] = useState("")
  const [advanceCount, setAdvanceCount] = useState("")
  const [isFinal, setIsFinal] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    API.get("/tournament/all").then(res => {
      setTournaments((res.data || []).filter(t => t.format === "full"))
    })
  }, [])

  const loadStages = (id) => {
    API.get(`/stages/tournament/${id}`).then(res => setStages(res.data))
  }

  useEffect(() => {
    if (selected) loadStages(selected)
    else setStages([])
  }, [selected])

  const createStage = async () => {
    if (!newStageName.trim()) { alert("Enter a stage name"); return }
    setBusy(true)
    try {
      await API.post(`/stages/${selected}/create`, {
        name: newStageName,
        advance_count: isFinal ? null : Number(advanceCount) || null,
        is_final: isFinal
      })
      setNewStageName("")
      setAdvanceCount("")
      setIsFinal(false)
      loadStages(selected)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create stage")
    } finally {
      setBusy(false)
    }
  }

  const hasActiveStage = stages.some(s => s.status === "active")
  const tournament = tournaments.find(t => t.id === selected)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <AdminTopBar />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>🎯 Manage Stages</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
          Run group stages, playoffs, and finals for Full Tournament format events.
        </p>

        <div className="field-group" style={{ marginBottom: 24 }}>
          <label>Select Tournament</label>
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">-- Choose a Full Tournament --</option>
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.game})</option>)}
          </select>
          {tournaments.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              No "Full Tournament" format events found — create one from Create Tournament first.
            </p>
          )}
        </div>

        {selected && (
          <>
            {stages.map(s => (
              <StageCard key={s.id} stage={s} onChanged={() => loadStages(selected)} />
            ))}

            {!hasActiveStage && tournament?.status !== "completed" && (
              <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 14 }}>
                  {stages.length === 0 ? "Start the first stage" : "Start the next stage"}
                </h3>
                <div className="field-group" style={{ marginBottom: 14 }}>
                  <label>Stage Name</label>
                  <input placeholder="e.g. Group Stage A, Semifinals, Grand Finals" value={newStageName}
                    onChange={e => setNewStageName(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  {!isFinal && (
                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label>Teams advancing from this stage</label>
                      <input type="number" placeholder="e.g. 16" value={advanceCount}
                        onChange={e => setAdvanceCount(e.target.value)} />
                    </div>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)', paddingBottom: 10 }}>
                    <input type="checkbox" checked={isFinal} onChange={e => setIsFinal(e.target.checked)} />
                    This is the final stage
                  </label>
                </div>
                <button className="btn-primary" style={{ marginTop: 10 }} disabled={busy} onClick={createStage}>
                  🚀 Start Stage
                </button>
              </div>
            )}

            {tournament?.status === "completed" && (
              <div style={{ textAlign: 'center', color: 'var(--green)', padding: 20 }}>
                🏆 Tournament completed!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminStages
