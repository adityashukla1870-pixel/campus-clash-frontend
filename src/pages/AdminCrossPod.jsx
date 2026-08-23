import { useEffect, useState } from "react"
import { FiCheckCircle, FiPlus, FiKey, FiClock, FiStar, FiTrash2, FiSend, FiTarget, FiArrowRight } from "react-icons/fi"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"
import { SkeletonText, SkeletonTable, SkeletonBlock, SkeletonCard } from "../components/Skeleton"

function CrossPodMatchCard({ match, isSquad, onChanged }) {
  const [roomDraft, setRoomDraft] = useState({})
  const [resultDrafts, setResultDrafts] = useState({})
  const [busy, setBusy] = useState(false)
  const [allParticipants, setAllParticipants] = useState([])

  const loadParticipants = () => {
    API.get(`/cross-pod/matches/${match.id}`).then(res => {
      const m = res.data
      const combined = [...(m.pod_a_participants || []), ...(m.pod_b_participants || [])]
      setAllParticipants(combined)
    }).catch(() => {})
  }

  useEffect(loadParticipants, [match.id])

  const releaseRoom = async () => {
    if (!roomDraft.room_id || !roomDraft.password) { alert("Room ID and password required"); return }
    setBusy(true)
    try {
      await API.post(`/cross-pod/matches/${match.id}/room`, roomDraft)
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to release room")
    } finally {
      setBusy(false)
    }
  }

  const submitResults = async () => {
    const results = allParticipants.map(p => {
      const draft = resultDrafts[p.registration_id] || {}
      if (isSquad && p.team_members?.length > 0) {
        const allNames = [
          ...(p.team_leader ? [{ name: p.team_leader.name }] : []),
          ...p.team_members
        ]
        const players = allNames.map(mem => ({
          name: mem.name,
          kills: Number(draft.playerKills?.[mem.name] || 0)
        }))
        return { registration_id: p.registration_id, placement: Number(draft.placement || 0), players }
      }
      return { registration_id: p.registration_id, placement: Number(draft.placement || 0), kills: Number(draft.kills || 0) }
    }).filter(r => r.placement > 0)

    if (results.length === 0) { alert("Enter at least one placement"); return }
    setBusy(true)
    try {
      await API.post(`/cross-pod/matches/${match.id}/results`, { results })
      setResultDrafts({})
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit results")
    } finally {
      setBusy(false)
    }
  }

  const setPlacement = (regId, value) => {
    setResultDrafts(prev => ({ ...prev, [regId]: { ...prev[regId], placement: value } }))
  }

  const setTeamKills = (regId, value) => {
    setResultDrafts(prev => ({ ...prev, [regId]: { ...prev[regId], kills: value } }))
  }

  const setPlayerKills = (regId, playerName, value) => {
    setResultDrafts(prev => ({
      ...prev,
      [regId]: { ...prev[regId], playerKills: { ...prev[regId]?.playerKills, [playerName]: value } }
    }))
  }

  const statusColor = match.status === 'completed' ? 'var(--green)' : match.room_id ? 'var(--cyan)' : 'var(--text-muted)'
  const StatusIcon = match.status === 'completed' ? FiCheckCircle : match.room_id ? FiKey : FiClock
  const statusText = match.status === 'completed' ? 'Results in' : match.room_id ? 'Room live' : 'Not started'

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          {match.pod_a_name} <FiArrowRight style={{ fontSize: 12 }} /> {match.pod_b_name}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Match {match.match_number}</span>
        <span style={{ fontSize: 11, color: statusColor, display: 'flex', alignItems: 'center', gap: 4 }}>
          <StatusIcon /> {statusText}
        </span>
      </div>

      {match.map && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Map: {match.map}</div>}

      {!match.room_id && match.status !== 'completed' && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <input placeholder="Room ID" style={{ flex: 1, minWidth: 90 }}
            onChange={e => setRoomDraft(prev => ({ ...prev, room_id: e.target.value }))} />
          <input placeholder="Password" style={{ flex: 1, minWidth: 90 }}
            onChange={e => setRoomDraft(prev => ({ ...prev, password: e.target.value }))} />
          <input type="datetime-local"
            onChange={e => setRoomDraft(prev => ({ ...prev, start_time: e.target.value }))} />
          <button className="btn-secondary" disabled={busy} onClick={releaseRoom}>Release</button>
        </div>
      )}

      {match.room_id && match.status !== 'completed' && (
        <div style={{ fontSize: 12, color: 'var(--cyan)', marginBottom: 8 }}>Room: {match.room_id} / {match.room_password}</div>
      )}

      {match.status !== 'completed' && allParticipants.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
            Enter placement{isSquad ? ' + per-player kills' : ' + team kills'}:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {allParticipants.map(p => {
              const roster = isSquad ? [
                ...(p.team_leader ? [{ name: p.team_leader.name }] : []),
                ...(p.team_members || [])
              ] : []
              const draft = resultDrafts[p.registration_id] || {}
              return (
                <div key={p.registration_id} style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 8 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: isSquad ? 6 : 0 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 50 }}>{p.pod_name}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                    <input type="number" placeholder="Rank" style={{ width: 60 }} value={draft.placement || ""}
                      onChange={e => setPlacement(p.registration_id, e.target.value)} />
                    {!isSquad && (
                      <input type="number" placeholder="Kills" style={{ width: 60 }} value={draft.kills || ""}
                        onChange={e => setTeamKills(p.registration_id, e.target.value)} />
                    )}
                  </div>
                  {isSquad && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 10 }}>
                      {roster.map(mem => (
                        <div key={mem.name} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{mem.name}</span>
                          <input type="number" placeholder="Kills" style={{ width: 60 }} value={draft.playerKills?.[mem.name] || ""}
                            onChange={e => setPlayerKills(p.registration_id, mem.name, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <button className="btn-primary" disabled={busy} onClick={submitResults}>Submit Results</button>
        </div>
      )}

      {match.status === 'completed' && (
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
          {match.mvp && <div style={{ color: 'var(--gold)', marginBottom: 4 }}><FiStar /> MVP: {match.mvp.name} ({match.mvp.team_name}) — {match.mvp.kills} kills</div>}
          {[...match.results].sort((a, b) => a.placement - b.placement).map(r => (
            <div key={r.registration_id}>#{r.placement} {r.name} — {r.kills} kills — {r.points} pts</div>
          ))}
        </div>
      )}
    </div>
  )
}

function RoundRobinSection({ rr, isSquad, onChanged }) {
  const [detail, setDetail] = useState(null)
  const [standings, setStandings] = useState([])
  const [busy, setBusy] = useState(false)
  const [newMatchPodA, setNewMatchPodA] = useState("")
  const [newMatchPodB, setNewMatchPodB] = useState("")
  const [newMatchMap, setNewMatchMap] = useState("")

  const load = () => {
    API.get(`/cross-pod/${rr.id}`).then(res => setDetail(res.data))
    API.get(`/cross-pod/${rr.id}/standings`).then(res => setStandings(res.data))
  }

  useEffect(load, [rr.id])

  const addMatch = async () => {
    if (!newMatchPodA || !newMatchPodB) { alert("Select both pods"); return }
    if (newMatchPodA === newMatchPodB) { alert("Select different pods"); return }
    setBusy(true)
    try {
      await API.post(`/cross-pod/${rr.id}/matches`, {
        pod_a_id: newMatchPodA, pod_b_id: newMatchPodB, map: newMatchMap || null
      })
      setNewMatchPodA("")
      setNewMatchPodB("")
      setNewMatchMap("")
      load()
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add match")
    } finally {
      setBusy(false)
    }
  }

  const finalizeRR = async () => {
    if (!confirm(`Finalize "${rr.name}" and lock in standings?`)) return
    setBusy(true)
    try {
      await API.post(`/cross-pod/${rr.id}/finalize`)
      load()
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to finalize")
    } finally {
      setBusy(false)
    }
  }

  const deleteMatch = async (matchId) => {
    if (!confirm("Delete this match?")) return
    try {
      await API.delete(`/cross-pod/matches/${matchId}`)
      load()
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete match")
    }
  }

  const deleteRR = async () => {
    if (!confirm(`Delete entire "${rr.name}"? This can't be undone.`)) return
    try {
      await API.delete(`/cross-pod/${rr.id}`)
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete")
    }
  }

  const allDone = detail?.matches?.every(m => m.status === 'completed')

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            {rr.name}
            <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: rr.status === 'completed' ? 'rgba(0,200,120,0.15)' : 'rgba(0,180,255,0.15)', color: rr.status === 'completed' ? 'var(--green)' : 'var(--cyan)' }}>
              {rr.status === 'completed' ? 'Finalized' : 'Active'}
            </span>
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {rr.pods?.length} groups · {rr.matches_per_pair} match{rr.matches_per_pair !== 1 ? 'es' : ''} per pair · {detail?.matches?.length || 0} total matches
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {rr.status === 'active' && (
            <button className="btn-success" disabled={!allDone || busy} onClick={finalizeRR}
              title={!allDone ? "Complete all matches first" : ""}>
              <FiCheckCircle /> Finalize
            </button>
          )}
          <button className="btn-danger" onClick={deleteRR}><FiTrash2 /> Delete</button>
        </div>
      </div>

      {/* Standings */}
      {standings.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Overall Standings</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '5px 8px' }}>#</th>
                  <th style={{ padding: '5px 8px' }}>Team</th>
                  <th style={{ padding: '5px 8px' }}>Group</th>
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
                    <td style={{ padding: '5px 8px', fontSize: 12, color: 'var(--text-muted)' }}>{s.pod_name}</td>
                    <td style={{ padding: '5px 8px' }}>{s.matches_played}</td>
                    <td style={{ padding: '5px 8px' }}>{s.total_kills}</td>
                    <td style={{ padding: '5px 8px', fontWeight: 700, color: 'var(--gold)' }}>{s.total_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Matches */}
      {detail?.matches?.map(m => (
        <div key={m.id} style={{ position: 'relative' }}>
          <CrossPodMatchCard match={m} isSquad={isSquad} onChanged={() => { load(); onChanged() }} />
          {rr.status === 'active' && m.status !== 'completed' && (
            <button onClick={() => deleteMatch(m.id)}
              style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>
              <FiTrash2 />
            </button>
          )}
        </div>
      ))}

      {/* Add match */}
      {rr.status === 'active' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border)', borderRadius: 10, padding: 12, marginTop: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}><FiPlus /> Add a cross-pod match</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <select value={newMatchPodA} onChange={e => setNewMatchPodA(e.target.value)} style={{ flex: 1, minWidth: 120 }}>
              <option value="">Pod A...</option>
              {rr.pods?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={newMatchPodB} onChange={e => setNewMatchPodB(e.target.value)} style={{ flex: 1, minWidth: 120 }}>
              <option value="">Pod B...</option>
              {rr.pods?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input placeholder="Map (optional)" style={{ flex: 1, minWidth: 100 }} value={newMatchMap} onChange={e => setNewMatchMap(e.target.value)} />
            <button className="btn-secondary" disabled={busy || !newMatchPodA || !newMatchPodB} onClick={addMatch}>+ Add</button>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminCrossPod() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState("")
  const [tournament, setTournament] = useState(null)
  const [stages, setStages] = useState([])
  const [roundRobins, setRoundRobins] = useState([])
  const [rrName, setRRName] = useState("Round Robin")
  const [rrMatchesPerPair, setRRMatchesPerPair] = useState("1")
  const [selectedStage, setSelectedStage] = useState("")
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

  const loadRRs = (id) => {
    API.get(`/cross-pod/tournament/${id}`).then(res => setRoundRobins(res.data))
  }

  useEffect(() => {
    if (selected) {
      loadStages(selected)
      loadRRs(selected)
      API.get(`/tournament/${selected}`).then(res => setTournament(res.data))
    } else {
      setStages([])
      setRoundRobins([])
      setTournament(null)
    }
  }, [selected])

  const createRR = async () => {
    if (!rrName.trim()) { alert("Enter a round-robin name"); return }
    if (!selectedStage) { alert("Select a stage with pods"); return }
    setBusy(true)
    try {
      await API.post(`/cross-pod/${selected}/create`, {
        stage_id: selectedStage,
        name: rrName,
        matches_per_pair: Number(rrMatchesPerPair) || 1
      })
      setRRName("Round Robin")
      setRRMatchesPerPair("1")
      setSelectedStage("")
      loadRRs(selected)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create round-robin")
    } finally {
      setBusy(false)
    }
  }

  const isSquad = tournament?.mode === "squad"
  const hasActiveRR = roundRobins.some(rr => rr.status === "active")

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <AdminTopBar />
        {initialLoading ? (
          <>
            <SkeletonText width="200px" height={28} style={{ marginBottom: 6 }} />
            <SkeletonText width="320px" height={14} style={{ marginBottom: 28 }} />
            <SkeletonBlock height={200} style={{ borderRadius: 16, marginBottom: 24 }} />
            <SkeletonTable rows={4} cols={4} />
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
              <FiTarget /> Cross-Pod Round Robin
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
              Pair groups against each other — every team competes across combined 10-player lobbies.
            </p>

            <div className="field-group" style={{ marginBottom: 24 }}>
              <label>Select Tournament</label>
              <select value={selected} onChange={e => setSelected(e.target.value)}>
                <option value="">-- Choose a Full Tournament --</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.game})</option>)}
              </select>
            </div>

            {selected && (
              <>
                {/* Create new round-robin */}
                {stages.length > 0 && (
                  <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 16, padding: 22, marginBottom: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 14 }}>
                      <FiPlus /> Start Cross-Pod Round Robin
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                      Select a stage that already has 2+ groups. Groups will be paired head-to-head in combined lobbies.
                    </p>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>Round Robin Name</label>
                        <input placeholder="e.g. Group Phase" value={rrName} onChange={e => setRRName(e.target.value)} style={{ width: 180 }} />
                      </div>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>Source Stage</label>
                        <select value={selectedStage} onChange={e => setSelectedStage(e.target.value)} style={{ width: 180 }}>
                          <option value="">Select stage...</option>
                          {stages.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.pod_count} groups, {s.team_count} teams)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>Matches per pair</label>
                        <input type="number" min="1" max="10" value={rrMatchesPerPair}
                          onChange={e => setRRMatchesPerPair(e.target.value)} style={{ width: 80 }} />
                      </div>
                      <button className="btn-primary" disabled={busy || !selectedStage} onClick={createRR}>
                        <FiSend /> Create Round Robin
                      </button>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                      3 groups + 2 matches/pair = 6 total matches. Each team plays 4 matches.
                    </p>
                  </div>
                )}

                {/* Existing round-robins */}
                {roundRobins.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    No cross-pod round robins yet. Create one above.
                  </div>
                )}

                {[...roundRobins].reverse().map(rr => (
                  <RoundRobinSection key={rr.id} rr={rr} isSquad={isSquad} onChanged={() => loadRRs(selected)} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminCrossPod
