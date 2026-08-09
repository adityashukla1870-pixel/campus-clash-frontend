import { useEffect, useState } from "react"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"
import { SkeletonText, SkeletonTable, SkeletonBlock, SkeletonCard } from "../components/Skeleton"

function PodCard({ pod, isSquad, stageId, onChanged }) {
  const [detail, setDetail] = useState(null)
  const [standings, setStandings] = useState([])
  const [newMap, setNewMap] = useState("")
  const [roomDrafts, setRoomDrafts] = useState({})
  const [resultDrafts, setResultDrafts] = useState({})
  const [busy, setBusy] = useState(false)
  const [unassigned, setUnassigned] = useState([])
  const [addSelection, setAddSelection] = useState("")

  const load = () => {
    API.get(`/stages/pods/${pod.id}`).then(res => setDetail(res.data))
    API.get(`/stages/pods/${pod.id}/standings`).then(res => setStandings(res.data))
    if (pod.status === 'active') {
      API.get(`/stages/${stageId}/unassigned`).then(res => setUnassigned(res.data)).catch(() => setUnassigned([]))
    }
  }

  useEffect(load, [pod.id])

  const addParticipant = async () => {
    if (!addSelection) return
    setBusy(true)
    try {
      await API.post(`/stages/pods/${pod.id}/add-participant`, { registration_id: addSelection })
      setAddSelection("")
      load()
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add team")
    } finally {
      setBusy(false)
    }
  }

  const addMatch = async () => {
    setBusy(true)
    try {
      await API.post(`/stages/pods/${pod.id}/matches`, { map: newMap })
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
    const results = pod.participants.map(p => {
      const teamDraft = draft[p.registration_id] || {}
      if (isSquad && p.team_members?.length > 0) {
        const allNames = [{ name: p.name }, ...p.team_members]
        const players = allNames.map(mem => ({
          name: mem.name,
          kills: Number(teamDraft.playerKills?.[mem.name] || 0)
        }))
        return { registration_id: p.registration_id, placement: Number(teamDraft.placement || 0), players }
      }
      return { registration_id: p.registration_id, placement: Number(teamDraft.placement || 0), kills: Number(teamDraft.kills || 0) }
    }).filter(r => r.placement > 0)

    if (results.length === 0) { alert("Enter at least one placement"); return }
    setBusy(true)
    try {
      await API.post(`/stages/matches/${matchId}/results`, { results })
      setResultDrafts(prev => {
        const next = { ...prev }
        delete next[matchId]
        return next
      })
      load()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit results")
    } finally {
      setBusy(false)
    }
  }

  const finalizePod = async () => {
    if (!confirm(`Finalize "${pod.name}" and lock in standings?`)) return
    setBusy(true)
    try {
      await API.post(`/stages/pods/${pod.id}/finalize`)
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to finalize pod")
    } finally {
      setBusy(false)
    }
  }

  const setRoomField = (matchId, field, value) => {
    setRoomDrafts(prev => ({ ...prev, [matchId]: { ...prev[matchId], [field]: value } }))
  }

  const setPlacement = (matchId, regId, value) => {
    setResultDrafts(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [regId]: { ...prev[matchId]?.[regId], placement: value }
      }
    }))
  }

  const setTeamKills = (matchId, regId, value) => {
    setResultDrafts(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [regId]: { ...prev[matchId]?.[regId], kills: value }
      }
    }))
  }

  const setPlayerKills = (matchId, regId, playerName, value) => {
    setResultDrafts(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [regId]: {
          ...prev[matchId]?.[regId],
          playerKills: { ...prev[matchId]?.[regId]?.playerKills, [playerName]: value }
        }
      }
    }))
  }

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700 }}>{pod.name}</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {pod.participants.length} teams · {pod.status === 'completed' ? '✅ Finalized' : '🟢 Active'}
          </p>
        </div>
        {pod.status === 'active' && (
          <button className="btn-success" disabled={busy} onClick={finalizePod}>✅ Finalize Pod</button>
        )}
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '5px 8px' }}>#</th>
              <th style={{ padding: '5px 8px' }}>Team</th>
              <th style={{ padding: '5px 8px' }}>M</th>
              <th style={{ padding: '5px 8px' }}>Kills</th>
              <th style={{ padding: '5px 8px' }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(s => (
              <tr key={s.registration_id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px' }}>{s.rank}</td>
                <td style={{ padding: '5px 8px' }}>{s.name}</td>
                <td style={{ padding: '5px 8px' }}>{s.matches_played}</td>
                <td style={{ padding: '5px 8px' }}>{s.total_kills}</td>
                <td style={{ padding: '5px 8px', fontWeight: 700, color: 'var(--gold)' }}>{s.total_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pod.status === 'active' && (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 10, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            ➕ Add a team approved after this group was created
          </div>
          {unassigned.length === 0 ? (
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>No unassigned approved teams right now.</div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select value={addSelection} onChange={e => setAddSelection(e.target.value)} style={{ flex: 1, minWidth: 160 }}>
                <option value="">Select a team...</option>
                {unassigned.map(u => <option key={u.registration_id} value={u.registration_id}>{u.name}</option>)}
              </select>
              <button className="btn-secondary" disabled={busy || !addSelection} onClick={addParticipant}>
                Add to {pod.name}
              </button>
            </div>
          )}
        </div>
      )}

      {detail?.matches?.map(m => (
        <div key={m.id} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13.5 }}>
            Match {m.match_number} {m.map && `— ${m.map}`}
            <span style={{ marginLeft: 8, fontSize: 11, color: m.status === 'completed' ? 'var(--green)' : 'var(--text-muted)' }}>
              {m.status === 'completed' ? '✅ Results in' : m.room_id ? '🔑 Room live' : '⏳ Not started'}
            </span>
          </div>

          {!m.room_id && pod.status === 'active' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <input placeholder="Room ID" style={{ flex: 1, minWidth: 90 }} onChange={e => setRoomField(m.id, 'room_id', e.target.value)} />
              <input placeholder="Password" style={{ flex: 1, minWidth: 90 }} onChange={e => setRoomField(m.id, 'password', e.target.value)} />
              <input type="datetime-local" onChange={e => setRoomField(m.id, 'start_time', e.target.value)} />
              <button className="btn-secondary" disabled={busy} onClick={() => releaseRoom(m.id)}>Release</button>
            </div>
          )}

          {m.room_id && m.status !== 'completed' && (
            <div style={{ fontSize: 12, color: 'var(--cyan)', marginBottom: 8 }}>Room: {m.room_id} / {m.room_password}</div>
          )}

          {m.status !== 'completed' && pod.status === 'active' && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                Enter placement{isSquad ? ' + per-player kills' : ' + team kills'}:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
                {pod.participants.map(p => {
                  const roster = isSquad ? [{ name: p.name }, ...(p.team_members || [])] : []
                  const teamDraft = resultDrafts[m.id]?.[p.registration_id] || {}
                  return (
                    <div key={p.registration_id} style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 8 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: isSquad ? 6 : 0 }}>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                        <input type="number" placeholder="Rank" style={{ width: 60 }} value={teamDraft.placement || ""}
                          onChange={e => setPlacement(m.id, p.registration_id, e.target.value)} />
                        {!isSquad && (
                          <input type="number" placeholder="Kills" style={{ width: 60 }} value={teamDraft.kills || ""}
                            onChange={e => setTeamKills(m.id, p.registration_id, e.target.value)} />
                        )}
                      </div>
                      {isSquad && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 10 }}>
                          {roster.map(mem => (
                            <div key={mem.name} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{mem.name}</span>
                              <input type="number" placeholder="Kills" style={{ width: 60 }} value={teamDraft.playerKills?.[mem.name] || ""}
                                onChange={e => setPlayerKills(m.id, p.registration_id, mem.name, e.target.value)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <button className="btn-primary" disabled={busy} onClick={() => submitResults(m.id)}>Submit Results</button>
            </div>
          )}

          {m.status === 'completed' && (
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
              {m.mvp && <div style={{ color: 'var(--gold)', marginBottom: 4 }}>⭐ MVP: {m.mvp.name} ({m.mvp.team_name}) — {m.mvp.kills} kills</div>}
              {[...m.results].sort((a, b) => a.placement - b.placement).map(r => (
                <div key={r.registration_id}>#{r.placement} {r.name} — {r.kills} kills — {r.points} pts</div>
              ))}
            </div>
          )}
        </div>
      ))}

      {pod.status === 'active' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Map (optional)" style={{ flex: 1 }} value={newMap} onChange={e => setNewMap(e.target.value)} />
          <button className="btn-secondary" disabled={busy} onClick={addMatch}>+ Add Match</button>
        </div>
      )}
    </div>
  )
}

function StageSection({ stageSummary, isSquad, onChanged }) {
  const [detail, setDetail] = useState(null)

  const load = () => {
    API.get(`/stages/${stageSummary.id}`).then(res => setDetail(res.data))
  }

  useEffect(load, [stageSummary.id])

  const allPodsDone = detail?.pods?.every(p => p.status === 'completed')

  const finalizeStage = async () => {
    const msg = stageSummary.is_final
      ? "Finalize this stage and declare the tournament winner? This can't be undone."
      : `Finalize "${stageSummary.name}"? This can't be undone.`
    if (!confirm(msg)) return
    try {
      await API.post(`/stages/${stageSummary.id}/finalize`)
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to finalize stage")
    }
  }

  const deleteStage = async () => {
    if (!confirm(`Delete "${stageSummary.name}" completely? This removes all its groups and match data — can't be undone.`)) return
    try {
      await API.delete(`/stages/${stageSummary.id}`)
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete stage")
    }
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, display: 'flex', alignItems: 'center', gap: 8 }}>
            {stageSummary.name}
            {stageSummary.is_final && <span className="badge badge-purple">FINAL</span>}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {stageSummary.pod_count} group{stageSummary.pod_count !== 1 ? 's' : ''} · {stageSummary.team_count} teams
            {stageSummary.advance_count ? ` · Top ${stageSummary.advance_count} advance per group` : ''}
          </p>
        </div>
        {stageSummary.status === 'active' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-success" disabled={!allPodsDone} onClick={finalizeStage} title={!allPodsDone ? "Finalize every group first" : ""}>
              {stageSummary.is_final ? '🏆 Finalize & Declare Winner' : '✅ Finalize Stage'}
            </button>
            <button className="btn-danger" onClick={deleteStage}>🗑️ Delete</button>
          </div>
        )}
      </div>

      {detail?.pods?.map(p => (
        <PodCard key={p.id} pod={p} isSquad={isSquad} stageId={stageSummary.id} onChanged={() => { load(); onChanged() }} />
      ))}
    </div>
  )
}

function AdminStages() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState("")
  const [tournament, setTournament] = useState(null)
  const [stages, setStages] = useState([])
  const [newStageName, setNewStageName] = useState("")
  const [podCount, setPodCount] = useState("1")
  const [advanceCount, setAdvanceCount] = useState("")
  const [isFinal, setIsFinal] = useState(false)
  const [seedStrategy, setSeedStrategy] = useState("random")
  const [busy, setBusy] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    API.get("/tournament/all").then(res => {
      setTournaments((res.data || []).filter(t => t.format === "full"))
    }).catch(console.error).finally(() => setInitialLoading(false))
  }, [])

  const loadStages = (id) => {
    API.get(`/stages/tournament/${id}`).then(res => setStages(res.data))
  }

  useEffect(() => {
    if (selected) {
      loadStages(selected)
      API.get(`/tournament/${selected}`).then(res => setTournament(res.data))
    } else {
      setStages([])
      setTournament(null)
    }
  }, [selected])

  const createStage = async () => {
    if (!newStageName.trim()) { alert("Enter a stage name"); return }
    setBusy(true)
    try {
      await API.post(`/stages/${selected}/create`, {
        name: newStageName,
        pod_count: Number(podCount) || 1,
        advance_count: isFinal ? null : Number(advanceCount) || null,
        is_final: isFinal,
        seed_strategy: seedStrategy
      })
      setNewStageName("")
      setAdvanceCount("")
      setPodCount("1")
      setIsFinal(false)
      loadStages(selected)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create stage")
    } finally {
      setBusy(false)
    }
  }

  const hasActiveStage = stages.some(s => s.status === "active")
  const isSquad = tournament?.mode === "squad"

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <AdminTopBar />
        {initialLoading ? (
          <>
            <SkeletonText width="180px" height={28} style={{ marginBottom: 6 }} />
            <SkeletonText width="300px" height={14} style={{ marginBottom: 28 }} />
            <SkeletonBlock height={200} style={{ borderRadius: 16, marginBottom: 24 }} />
            <SkeletonTable rows={4} cols={4} />
            <SkeletonCard height={200} style={{ marginTop: 20 }} />
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>🎯 Manage Stages</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
              Groups, brackets, and finals — with parallel pods and a points-based leaderboard.
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
                {[...stages].reverse().map(s => (
                  <StageSection key={s.id} stageSummary={s} isSquad={isSquad} onChanged={() => loadStages(selected)} />
                ))}

                {!hasActiveStage && tournament?.status !== "completed" && (
                  <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 14 }}>
                      {stages.length === 0 ? "Start the first stage" : "Start the next stage"}
                    </h3>
                    <div className="field-group" style={{ marginBottom: 14 }}>
                      <label>Stage Name</label>
                      <input placeholder="e.g. Group Stage, Semifinals, Grand Finals" value={newStageName}
                        onChange={e => setNewStageName(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>Number of groups (pods)</label>
                        <input type="number" min="1" value={podCount} onChange={e => setPodCount(e.target.value)} style={{ width: 90 }} />
                      </div>
                      {!isFinal && (
                        <div className="field-group" style={{ marginBottom: 0 }}>
                          <label>Teams advancing per group</label>
                          <input type="number" placeholder="e.g. 4" value={advanceCount}
                            onChange={e => setAdvanceCount(e.target.value)} style={{ width: 100 }} />
                        </div>
                      )}
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)', paddingBottom: 10 }}>
                        <input type="checkbox" checked={isFinal} onChange={e => setIsFinal(e.target.checked)} />
                        This is the final stage
                      </label>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0' }}>
                      Tip: for a knockout bracket round, set groups = number of matchups and teams advancing = 1 per group.
                    </p>
                    <button className="btn-primary" style={{ marginTop: 6 }} disabled={busy} onClick={createStage}>
                      🚀 Start Stage
                    </button>
                  </div>
                )}

                {tournament?.status === "completed" && (
                  <div style={{ textAlign: 'center', color: 'var(--green)', padding: 20 }}>🏆 Tournament completed!</div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminStages
