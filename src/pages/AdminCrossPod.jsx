import { useEffect, useState } from "react"
import { FiCheckCircle, FiPlus, FiKey, FiClock, FiStar, FiTrash2, FiSend, FiTarget, FiArrowRight, FiChevronDown, FiChevronUp, FiAward } from "react-icons/fi"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"
import { SkeletonText, SkeletonTable, SkeletonBlock } from "../components/Skeleton"

function MatchCard({ match, isSquad, onChanged }) {
  const [roomDraft, setRoomDraft] = useState({})
  const [resultDrafts, setResultDrafts] = useState({})
  const [busy, setBusy] = useState(false)
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    API.get(`/cross-pod/matches/${match.id}`).then(res => {
      const m = res.data
      setParticipants([...(m.pod_a_participants || []), ...(m.pod_b_participants || [])])
    }).catch(() => {})
  }, [match.id])

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
    const results = participants.map(p => {
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

  const statusColor = match.status === 'completed' ? 'var(--green)' : match.room_id ? 'var(--cyan)' : 'var(--text-muted)'
  const statusText = match.status === 'completed' ? 'Done' : match.room_id ? 'Room Live' : 'Upcoming'

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>
            {match.pod_a_name} <FiArrowRight style={{ fontSize: 11 }} /> {match.pod_b_name}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Match {match.match_number}</span>
        </div>
        <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>{statusText}</span>
      </div>

      {match.map && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Map: {match.map}</div>}

      {!match.room_id && match.status !== 'completed' && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          <input placeholder="Room ID" style={{ flex: 1, minWidth: 80, fontSize: 12 }}
            onChange={e => setRoomDraft(prev => ({ ...prev, room_id: e.target.value }))} />
          <input placeholder="Password" style={{ flex: 1, minWidth: 80, fontSize: 12 }}
            onChange={e => setRoomDraft(prev => ({ ...prev, password: e.target.value }))} />
          <input type="datetime-local" style={{ fontSize: 12 }}
            onChange={e => setRoomDraft(prev => ({ ...prev, start_time: e.target.value }))} />
          <button className="btn-secondary" style={{ fontSize: 12 }} disabled={busy} onClick={releaseRoom}>Release</button>
        </div>
      )}

      {match.room_id && match.status !== 'completed' && (
        <div style={{ fontSize: 11, color: 'var(--cyan)', marginBottom: 6 }}>Room: {match.room_id} / {match.room_password}</div>
      )}

      {match.status !== 'completed' && participants.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
            Enter placement{isSquad ? ' + per-player kills' : ' + team kills'}:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
            {participants.map(p => {
              const roster = isSquad ? [
                ...(p.team_leader ? [{ name: p.team_leader.name }] : []),
                ...(p.team_members || [])
              ] : []
              const draft = resultDrafts[p.registration_id] || {}
              return (
                <div key={p.registration_id} style={{ background: 'var(--bg-surface)', borderRadius: 6, padding: 6 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: isSquad ? 4 : 0 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', minWidth: 40 }}>{p.pod_name}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{p.name}</span>
                    <input type="number" placeholder="#" style={{ width: 48, fontSize: 12 }} value={draft.placement || ""}
                      onChange={e => setResultDrafts(prev => ({ ...prev, [p.registration_id]: { ...prev[p.registration_id], placement: e.target.value } }))} />
                    {!isSquad && (
                      <input type="number" placeholder="K" style={{ width: 48, fontSize: 12 }} value={draft.kills || ""}
                        onChange={e => setResultDrafts(prev => ({ ...prev, [p.registration_id]: { ...prev[p.registration_id], kills: e.target.value } }))} />
                    )}
                  </div>
                  {isSquad && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 8 }}>
                      {roster.map(mem => (
                        <div key={mem.name} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <span style={{ flex: 1, fontSize: 11, color: 'var(--text-secondary)' }}>{mem.name}</span>
                          <input type="number" placeholder="K" style={{ width: 48, fontSize: 11 }}
                            value={draft.playerKills?.[mem.name] || ""}
                            onChange={e => setResultDrafts(prev => ({
                              ...prev,
                              [p.registration_id]: { ...prev[p.registration_id], playerKills: { ...prev[p.registration_id]?.playerKills, [mem.name]: e.target.value } }
                            }))} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <button className="btn-primary" style={{ fontSize: 12 }} disabled={busy} onClick={submitResults}>Submit Results</button>
        </div>
      )}

      {match.status === 'completed' && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          {match.mvp && <div style={{ color: 'var(--gold)', marginBottom: 2 }}><FiStar /> MVP: {match.mvp.name} ({match.mvp.kills}k)</div>}
          {[...match.results].sort((a, b) => a.placement - b.placement).slice(0, 3).map(r => (
            <span key={r.registration_id} style={{ marginRight: 8 }}>#{r.placement} {r.name} ({r.points}pts)</span>
          ))}
          {match.results.length > 3 && <span style={{ color: 'var(--text-muted)' }}>+{match.results.length - 3} more</span>}
        </div>
      )}
    </div>
  )
}

function OverallLeaderboard({ standings }) {
  if (!standings || standings.length === 0) return null
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiAward style={{ color: 'var(--gold)' }} /> Overall Leaderboard
        <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>(All Groups Combined)</span>
      </h3>

      {/* Top 3 highlight */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {standings.slice(0, 3).map((s, i) => (
          <div key={s.registration_id} style={{
            flex: 1, minWidth: 140, background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 14, textAlign: 'center',
            borderColor: i === 0 ? 'var(--gold)' : i === 1 ? '#c0c0c0' : '#cd7f32'
          }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{medals[i]}</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.pod_name}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)', marginTop: 4 }}>{s.total_points}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.total_kills} kills · {s.matches_played} matches</div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px' }}>#</th>
              <th style={{ padding: '6px 8px' }}>Team</th>
              <th style={{ padding: '6px 8px' }}>Group</th>
              <th style={{ padding: '6px 8px' }}>M</th>
              <th style={{ padding: '6px 8px' }}>Wins</th>
              <th style={{ padding: '6px 8px' }}>Kills</th>
              <th style={{ padding: '6px 8px' }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.registration_id} style={{
                borderBottom: '1px solid var(--border)',
                background: i < 3 ? 'rgba(212,175,55,0.05)' : 'transparent'
              }}>
                <td style={{ padding: '6px 8px', fontWeight: i < 3 ? 700 : 400 }}>{s.rank}</td>
                <td style={{ padding: '6px 8px', fontWeight: i < 3 ? 700 : 400 }}>{s.name}</td>
                <td style={{ padding: '6px 8px', fontSize: 11, color: 'var(--text-muted)' }}>{s.pod_name}</td>
                <td style={{ padding: '6px 8px' }}>{s.matches_played}</td>
                <td style={{ padding: '6px 8px' }}>{s.chicken_dinners}</td>
                <td style={{ padding: '6px 8px' }}>{s.total_kills}</td>
                <td style={{ padding: '6px 8px', fontWeight: 700, color: 'var(--gold)' }}>{s.total_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminCrossPod() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState("")
  const [tournament, setTournament] = useState(null)
  const [roundRobins, setRoundRobins] = useState([])
  const [detail, setDetail] = useState(null)
  const [standings, setStandings] = useState([])
  const [busy, setBusy] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showGroupStandings, setShowGroupStandings] = useState(false)

  useEffect(() => {
    API.get("/tournament/all").then(res => {
      setTournaments((res.data || []).filter(t => t.format === "full"))
    }).catch(console.error).finally(() => setInitialLoading(false))
  }, [])

  const loadRR = (id) => {
    API.get(`/cross-pod/tournament/${id}`).then(res => {
      setRoundRobins(res.data)
      if (res.data.length > 0) {
        const latest = res.data[0]
        API.get(`/cross-pod/${latest.id}`).then(r => setDetail(r.data))
        API.get(`/cross-pod/${latest.id}/standings`).then(r => setStandings(r.data))
      } else {
        setDetail(null)
        setStandings([])
      }
    })
  }

  useEffect(() => {
    if (selected) {
      loadRR(selected)
      API.get(`/tournament/${selected}`).then(res => setTournament(res.data))
    } else {
      setRoundRobins([])
      setDetail(null)
      setStandings([])
      setTournament(null)
    }
  }, [selected])

  const generateRR = async () => {
    if (!selected) return
    setBusy(true)
    try {
      // Auto-find the first stage with pods
      const stagesRes = await API.get(`/stages/tournament/${selected}`)
      const stages = stagesRes.data || []
      if (stages.length === 0) { alert("Create groups first from Manage Stages"); setBusy(false); return }

      const stage = stages[0] // use the first/only stage
      await API.post(`/cross-pod/${selected}/create`, {
        stage_id: stage.id,
        name: "Round Robin",
        matches_per_pair: 3
      })
      loadRR(selected)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate round robin")
    } finally {
      setBusy(false)
    }
  }

  const finalizeRR = async () => {
    if (!detail) return
    if (!confirm("Finalize Round Robin? All 9 matches must be completed.")) return
    setBusy(true)
    try {
      await API.post(`/cross-pod/${detail.id}/finalize`)
      loadRR(selected)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to finalize")
    } finally {
      setBusy(false)
    }
  }

  const deleteRR = async () => {
    if (!detail) return
    if (!confirm("Delete entire Round Robin? This can't be undone.")) return
    try {
      await API.delete(`/cross-pod/${detail.id}`)
      loadRR(selected)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete")
    }
  }

  const isSquad = tournament?.mode === "squad"
  const hasRR = roundRobins.length > 0
  const allDone = detail?.matches?.every(m => m.status === 'completed')

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <AdminTopBar />
        {initialLoading ? (
          <>
            <SkeletonText width="200px" height={28} style={{ marginBottom: 6 }} />
            <SkeletonText width="320px" height={14} style={{ marginBottom: 28 }} />
            <SkeletonBlock height={200} style={{ borderRadius: 16, marginBottom: 24 }} />
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              <FiTarget /> Cross-Pod Round Robin
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
              3 Groups · 9 Matches · Combined 10-player lobbies · Overall Leaderboard
            </p>

            <div className="field-group" style={{ marginBottom: 20 }}>
              <label>Select Tournament</label>
              <select value={selected} onChange={e => setSelected(e.target.value)}>
                <option value="">-- Choose a Tournament --</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.game})</option>)}
              </select>
            </div>

            {selected && !hasRR && (
              <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                <FiTarget style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 12 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>
                  Generate Round Robin Matches
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, maxWidth: 460, margin: '0 auto 16px' }}>
                  This will auto-create <strong>9 matches</strong> across 3 group pairings:
                  <br />A vs B (3 matches) · B vs C (3 matches) · A vs C (3 matches)
                  <br />Each team plays <strong>6 matches</strong> total.
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Make sure you've already created a stage with 3 groups from <strong>Manage Stages</strong>.
                </p>
                <button className="btn-primary" disabled={busy} onClick={generateRR} style={{ fontSize: 14, padding: '10px 28px' }}>
                  <FiSend /> Generate 9 Matches
                </button>
              </div>
            )}

            {selected && hasRR && (
              <>
                {/* Action bar */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {detail?.status === 'active' && (
                    <button className="btn-success" disabled={!allDone || busy} onClick={finalizeRR}
                      title={!allDone ? "Complete all 9 matches first" : ""}>
                      <FiCheckCircle /> Finalize & Declare Winners
                    </button>
                  )}
                  {detail?.status === 'active' && (
                    <button className="btn-danger" onClick={deleteRR}><FiTrash2 /> Delete</button>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 8 }}>
                    {detail?.matches?.filter(m => m.status === 'completed').length || 0} / {detail?.matches?.length || 0} matches done
                  </span>
                </div>

                {/* Overall leaderboard — MAIN */}
                <OverallLeaderboard standings={standings} />

                {/* Matches grouped by pairing */}
                {Object.entries(matchGroups).map(([pairName, matches]) => (
                  <div key={pairName} style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                      {pairName}
                    </h4>
                    {matches.map(m => (
                      <MatchCard key={m.id} match={m} isSquad={isSquad} onChanged={() => loadRR(selected)} />
                    ))}
                  </div>
                ))}

                {/* Per-group standings — SECONDARY */}
                {Object.keys(groupStandings).length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <button onClick={() => setShowGroupStandings(!showGroupStandings)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '8px 0' }}>
                      {showGroupStandings ? <FiChevronUp /> : <FiChevronDown />}
                      Group-wise Leaderboards
                    </button>
                    {showGroupStandings && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {Object.entries(groupStandings).map(([groupName, teams]) => (
                          <div key={groupName} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{groupName}</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                              <thead>
                                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                  <th style={{ padding: '4px 6px' }}>#</th>
                                  <th style={{ padding: '4px 6px' }}>Team</th>
                                  <th style={{ padding: '4px 6px' }}>M</th>
                                  <th style={{ padding: '4px 6px' }}>Kills</th>
                                  <th style={{ padding: '4px 6px' }}>Pts</th>
                                </tr>
                              </thead>
                              <tbody>
                                {teams.map(s => (
                                  <tr key={s.registration_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '4px 6px' }}>{s.rank}</td>
                                    <td style={{ padding: '4px 6px' }}>{s.name}</td>
                                    <td style={{ padding: '4px 6px' }}>{s.matches_played}</td>
                                    <td style={{ padding: '4px 6px' }}>{s.total_kills}</td>
                                    <td style={{ padding: '4px 6px', fontWeight: 700, color: 'var(--gold)' }}>{s.total_points}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {detail?.status === 'completed' && (
                  <div style={{ textAlign: 'center', color: 'var(--green)', padding: 20, fontSize: 15 }}>
                    <FiAward /> Round Robin Finalized!
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminCrossPod
