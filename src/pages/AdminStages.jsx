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

function FinalParticipantsPanel({ tournamentId, tournament, onGrouped }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [manualMode, setManualMode] = useState(false)
  const [groupCount, setGroupCount] = useState(2)
  const [assignments, setAssignments] = useState({}) // registration_id -> group index
  const [stageName, setStageName] = useState("Group Stage")
  const [advanceCount, setAdvanceCount] = useState("")
  const [podCount, setPodCount] = useState("2")
  const [seedStrategy, setSeedStrategy] = useState("random")
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    API.get(`/tournament/admin/${tournamentId}/final-participants`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [tournamentId])

  const downloadCsv = async () => {
    try {
      const res = await API.get(`/tournament/admin/${tournamentId}/final-participants.csv`, { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = `${(tournament?.name || "tournament").replace(/\s+/g, "_")}_final_list.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert("Failed to download final list")
    }
  }

  const assignGroup = (registrationId, groupIndex) => {
    setAssignments(prev => ({ ...prev, [registrationId]: groupIndex }))
  }

  const launchAuto = async () => {
    if (!stageName.trim()) { alert("Enter a stage name"); return }
    setBusy(true)
    try {
      await API.post(`/stages/${tournamentId}/create`, {
        name: stageName,
        pod_count: Number(podCount) || 1,
        advance_count: Number(advanceCount) || null,
        is_final: false,
        seed_strategy: seedStrategy
      })
      onGrouped()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to launch groups")
    } finally {
      setBusy(false)
    }
  }

  const launchManual = async () => {
    if (!stageName.trim()) { alert("Enter a stage name"); return }
    const participants = data?.participants || []
    const unassigned = participants.filter(p => assignments[p.registration_id] === undefined)
    if (unassigned.length > 0) {
      alert(`Assign a group to everyone first — missing: ${unassigned.map(p => p.team_name || p.player_name).join(", ")}`)
      return
    }
    const groups = Array.from({ length: groupCount }, (_, i) =>
      participants.filter(p => assignments[p.registration_id] === i).map(p => p.registration_id)
    )
    setBusy(true)
    try {
      await API.post(`/stages/${tournamentId}/create-manual`, {
        name: stageName,
        advance_count: Number(advanceCount) || null,
        is_final: false,
        groups
      })
      onGrouped()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to launch groups")
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <SkeletonBlock height={180} style={{ borderRadius: 16, marginBottom: 24 }} />
  if (!data) return null

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>📋 Final Participant List</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {data.count} approved {data.count === 1 ? 'entry' : 'entries'} ·{' '}
            {data.registration_open
              ? <span style={{ color: 'var(--gold)' }}>Registration still open</span>
              : <span style={{ color: 'var(--cyan)' }}>Registration closed — list locked in</span>}
          </p>
        </div>
        <button className="btn-secondary" onClick={downloadCsv} disabled={data.count === 0}>⬇️ Download CSV</button>
      </div>

      {data.count === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No approved participants yet.</p>
      ) : data.registration_open ? (
        <p style={{ fontSize: 13, color: 'var(--gold)', marginTop: 14 }}>
          ⏳ Groups can be launched once registration closes, so every approved entry makes it into the draw.
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap', margin: '16px 0' }}>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label>Stage Name</label>
              <input value={stageName} onChange={e => setStageName(e.target.value)} style={{ width: 200 }} />
            </div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label>Teams advancing per group</label>
              <input type="number" placeholder="optional" value={advanceCount} onChange={e => setAdvanceCount(e.target.value)} style={{ width: 140 }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)', paddingBottom: 10 }}>
              <input type="checkbox" checked={manualMode} onChange={e => setManualMode(e.target.checked)} />
              Manually pick groups
            </label>
          </div>

          {!manualMode ? (
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="field-group" style={{ marginBottom: 0 }}>
                <label>Number of groups</label>
                <input type="number" min="1" value={podCount} onChange={e => setPodCount(e.target.value)} style={{ width: 90 }} />
              </div>
              <div className="field-group" style={{ marginBottom: 0 }}>
                <label>Distribution</label>
                <select value={seedStrategy} onChange={e => setSeedStrategy(e.target.value)} style={{ width: 160 }}>
                  <option value="random">Random draw</option>
                  <option value="snake">Snake seeding</option>
                </select>
              </div>
              <button className="btn-primary" disabled={busy} onClick={launchAuto}>🚀 Launch Groups</button>
            </div>
          ) : (
            <div>
              <div className="field-group" style={{ marginBottom: 14, maxWidth: 160 }}>
                <label>Number of groups</label>
                <input type="number" min="1" value={groupCount} onChange={e => setGroupCount(Number(e.target.value) || 1)} />
              </div>
              <div style={{ overflowX: 'auto', marginBottom: 14 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '6px 8px' }}>Team / Player</th>
                      <th style={{ padding: '6px 8px' }}>Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.participants.map(p => (
                      <tr key={p.registration_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '6px 8px' }}>{p.team_name || p.player_name}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <select
                            value={assignments[p.registration_id] ?? ""}
                            onChange={e => assignGroup(p.registration_id, Number(e.target.value))}
                          >
                            <option value="" disabled>Pick group</option>
                            {Array.from({ length: groupCount }, (_, i) => (
                              <option key={i} value={i}>Group {String.fromCharCode(65 + i)}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn-primary" disabled={busy} onClick={launchManual}>🚀 Launch Groups</button>
            </div>
          )}
        </>
      )}
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
                {stages.length === 0 && tournament?.status !== "completed" && (
                  <FinalParticipantsPanel
                    tournamentId={selected}
                    tournament={tournament}
                    onGrouped={() => { loadStages(selected); API.get(`/tournament/${selected}`).then(res => setTournament(res.data)) }}
                  />
                )}

                {[...stages].reverse().map(s => (
                  <StageSection key={s.id} stageSummary={s} isSquad={isSquad} onChanged={() => loadStages(selected)} />
                ))}

                {!hasActiveStage && stages.length > 0 && tournament?.status !== "completed" && (
                  <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 14 }}>
                      Start the next stage
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
