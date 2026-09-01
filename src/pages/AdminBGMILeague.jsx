import { useEffect, useState } from "react"
import { FiCheckCircle, FiKey, FiClock, FiStar, FiAward, FiTrash2, FiSend, FiTarget, FiZap, FiGrid, FiUsers, FiCalendar, FiMap } from "react-icons/fi"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"
import { SkeletonText, SkeletonBlock } from "../components/Skeleton"

function MatchCard({ match, isSquad, onChanged }) {
  const [roomDraft, setRoomDraft] = useState({})
  const [resultDrafts, setResultDrafts] = useState({})
  const [busy, setBusy] = useState(false)
  const [participants, setParticipants] = useState(match.participants || [])
  const [slotAssignments, setSlotAssignments] = useState(match.slot_assignments || {})
  const [showSlots, setShowSlots] = useState(false)

  const slotLimit = match.slot_limit || 11

  const releaseRoom = async () => {
    if (!roomDraft.room_id || !roomDraft.password) { alert("Room ID and password required"); return }
    setBusy(true)
    try {
      await API.post(`/bgmi-league/matches/${match.id}/room`, {
        room_id: roomDraft.room_id,
        password: roomDraft.password,
        start_time: roomDraft.start_time,
        slot_assignments: slotAssignments
      })
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to release room")
    } finally {
      setBusy(false)
    }
  }

  const updateSlots = async () => {
    setBusy(true)
    try {
      await API.post(`/bgmi-league/matches/${match.id}/slots`, { slot_assignments: slotAssignments })
      alert("Slots updated!")
      onChanged()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update slots")
    } finally {
      setBusy(false)
    }
  }

  const handleSlotChange = (slot, registrationId) => {
    const newAssignments = { ...slotAssignments }
    if (registrationId) {
      const existing = Object.entries(newAssignments).find(([s, r]) => r === registrationId && s !== slot)
      if (existing) delete newAssignments[existing[0]]
      newAssignments[slot] = registrationId
    } else {
      delete newAssignments[slot]
    }
    setSlotAssignments(newAssignments)
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
        const totalKills = players.reduce((sum, pl) => sum + pl.kills, 0)
        return { registration_id: p.registration_id, placement: Number(draft.placement || 0), kills: totalKills, players }
      }
      return { registration_id: p.registration_id, placement: Number(draft.placement || 0), kills: Number(draft.kills || 0) }
    }).filter(r => r.placement > 0)

    if (results.length === 0) { alert("Enter at least one placement"); return }
    setBusy(true)
    try {
      await API.post(`/bgmi-league/matches/${match.id}/results`, { results })
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiZap style={{ color: 'var(--gold)', fontSize: 14 }} />
          <span style={{ fontWeight: 700, fontSize: 13 }}>Match {match.match_number}</span>
          <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'rgba(6,182,212,0.1)', color: 'var(--cyan)' }}>Day {match.day}</span>
          {match.map && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{match.map}</span>}
        </div>
        <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>{statusText}</span>
      </div>

      {!match.room_id && match.status !== 'completed' && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
            <input placeholder="Map" style={{ flex: 1, minWidth: 70, fontSize: 12 }}
              value={roomDraft.map || ""} onChange={e => setRoomDraft(prev => ({ ...prev, map: e.target.value }))} />
            <input placeholder="Room ID" style={{ flex: 1, minWidth: 80, fontSize: 12 }}
              onChange={e => setRoomDraft(prev => ({ ...prev, room_id: e.target.value }))} />
            <input placeholder="Password" style={{ flex: 1, minWidth: 80, fontSize: 12 }}
              onChange={e => setRoomDraft(prev => ({ ...prev, password: e.target.value }))} />
            <input type="datetime-local" style={{ fontSize: 12 }}
              onChange={e => setRoomDraft(prev => ({ ...prev, start_time: e.target.value }))} />
            <button className="btn-secondary" style={{ fontSize: 12 }} disabled={busy} onClick={releaseRoom}>Release</button>
          </div>
        </div>
      )}

      {match.status !== 'completed' && participants.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <button onClick={() => setShowSlots(!showSlots)}
            style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '4px 0' }}>
            <FiGrid size={12} />
            {showSlots ? 'Hide' : 'Assign'} Slots ({Object.keys(slotAssignments).length}/{slotLimit})
          </button>
          {showSlots && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6, marginTop: 6 }}>
                {Array.from({ length: slotLimit }, (_, i) => i + 1).map(slot => (
                  <div key={slot} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Slot {slot}</span>
                      <span style={{ fontSize: 10, color: slotAssignments[slot] ? 'var(--green)' : 'var(--text-muted)' }}>
                        {slotAssignments[slot] ? '✓' : '—'}
                      </span>
                    </div>
                    <select value={slotAssignments[slot] || ""} onChange={(e) => handleSlotChange(String(slot), e.target.value || null)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, background: 'var(--bg-dark)',
                        border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 11, cursor: 'pointer' }}>
                      <option value="">— Empty —</option>
                      {participants.map(p => (
                        <option key={p.registration_id} value={p.registration_id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button className="btn-secondary" style={{ fontSize: 12, marginTop: 8 }} disabled={busy} onClick={updateSlots}>
                {busy ? "Saving..." : "Update Slots"}
              </button>
            </div>
          )}
        </div>
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
          {[...match.results].sort((a, b) => a.placement - b.placement).slice(0, 5).map(r => (
            <span key={r.registration_id} style={{ marginRight: 8 }}>#{r.placement} {r.name} ({r.points}pts)</span>
          ))}
          {match.results.length > 5 && <span style={{ color: 'var(--text-muted)' }}>+{match.results.length - 5} more</span>}
        </div>
      )}
    </div>
  )
}

function AdminBGMILeague() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState("")
  const [tournament, setTournament] = useState(null)
  const [league, setLeague] = useState(null)
  const [standings, setStandings] = useState([])
  const [busy, setBusy] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [mapDrafts, setMapDrafts] = useState({})
  const [showMapEditor, setShowMapEditor] = useState(false)
  const [customMaps, setCustomMaps] = useState(Array(9).fill(""))
  const [useCustomMaps, setUseCustomMaps] = useState(false)

  useEffect(() => {
    API.get("/tournament/all").then(res => setTournaments(res.data || [])).catch(console.error).finally(() => setInitialLoading(false))
  }, [])

  const loadLeague = (id) => {
    API.get(`/bgmi-league/tournament/${id}`).then(res => {
      setLeague(res.data)
      if (res.data) {
        API.get(`/bgmi-league/tournament/${id}/standings`).then(r => setStandings(r.data || []))
      }
    })
  }

  useEffect(() => {
    if (selected) {
      loadLeague(selected)
      API.get(`/tournament/${selected}`).then(res => setTournament(res.data))
    } else {
      setLeague(null)
      setStandings([])
      setTournament(null)
    }
  }, [selected])

  const createLeague = async () => {
    if (!selected) return
    if (!confirm("Create BGMI League with 9 matches (3 per day x 3 days)?")) return
    setBusy(true)
    try {
      const payload = {
        name: `${tournament?.name || 'BGMI'} - League`,
        matches_per_day: [3, 3, 3]
      }
      if (useCustomMaps) {
        const maps = customMaps.filter(m => m.trim())
        if (maps.length > 0) payload.maps = maps
      }
      await API.post(`/bgmi-league/${selected}/create`, payload)
      loadLeague(selected)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create league")
    } finally {
      setBusy(false)
    }
  }

  const addMatches = async (count) => {
    if (!league) return
    if (!confirm(`Add ${count} more matches?`)) return
    setBusy(true)
    try {
      // Create a new league with additional matches
      await API.post(`/bgmi-league/${selected}/create`, {
        name: league.name,
        matches_per_day: [count]
      })
      loadLeague(selected)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add matches")
    } finally {
      setBusy(false)
    }
  }

  const finalizeLeague = async () => {
    if (!league) return
    if (!confirm("Finalize league? All matches must be completed. This will declare the winner.")) return
    setBusy(true)
    try {
      await API.post(`/bgmi-league/${league.id}/finalize`)
      loadLeague(selected)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to finalize")
    } finally {
      setBusy(false)
    }
  }

  const deleteLeague = async () => {
    if (!league) return
    if (!confirm("Delete entire league? This can't be undone.")) return
    try {
      await API.delete(`/bgmi-league/${league.id}`)
      loadLeague(selected)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete")
    }
  }

  const saveMaps = async () => {
    if (!league) return
    setBusy(true)
    try {
      await API.put(`/bgmi-league/${league.id}/maps`, { maps: mapDrafts })
      loadLeague(selected)
      setShowMapEditor(false)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save maps")
    } finally {
      setBusy(false)
    }
  }

  const BGMI_MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik", "Rondo"]

  const isSquad = tournament?.mode === "squad"
  const matches = league?.matches || []
  const matchesByDay = {}
  matches.forEach(m => {
    if (!matchesByDay[m.day]) matchesByDay[m.day] = []
    matchesByDay[m.day].push(m)
  })
  const allDone = matches.length > 0 && matches.every(m => m.status === 'completed')

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <AdminTopBar />
        {initialLoading ? (
          <>
            <SkeletonText width="200px" height={28} style={{ marginBottom: 6 }} />
            <SkeletonText width="320px" height={14} style={{ marginBottom: 28 }} />
            <SkeletonBlock height={200} style={{ borderRadius: 16 }} />
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              <FiZap /> BGMI League Manager
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
              Full Lobby matches — all teams play together. No groups needed.
            </p>

            <div className="field-group" style={{ marginBottom: 20 }}>
              <label>Select Tournament</label>
              <select value={selected} onChange={e => setSelected(e.target.value)}>
                <option value="">-- Choose a Tournament --</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.game})</option>)}
              </select>
            </div>

            {selected && !league && (
              <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                <FiZap style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 12 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>
                  Create BGMI League
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, maxWidth: 460, margin: '0 auto 16px' }}>
                  Creates <strong>9 matches</strong> across 3 days:
                  <br />Day 1: 3 matches · Day 2: 3 matches · Day 3: 3 matches
                  <br />All teams play together in every match (Full Lobby).
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={useCustomMaps} onChange={e => setUseCustomMaps(e.target.checked)} />
                    Set maps manually
                  </label>
                </div>

                {useCustomMaps && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6, marginBottom: 16, textAlign: 'left' }}>
                    {customMaps.map((map, i) => (
                      <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Match {i + 1} (Day {Math.floor(i / 3) + 1})</div>
                        <select value={map} onChange={e => {
                          const next = [...customMaps]
                          next[i] = e.target.value
                          setCustomMaps(next)
                        }} style={{ width: '100%', padding: '4px 6px', borderRadius: 4, background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 11 }}>
                          <option value="">Auto</option>
                          {BGMI_MAPS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                <button className="btn-primary" disabled={busy} onClick={createLeague} style={{ fontSize: 14, padding: '10px 28px' }}>
                  <FiSend /> Create League (9 Matches)
                </button>
              </div>
            )}

            {selected && league && (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {league.status === 'active' && (
                    <button className="btn-success" disabled={!allDone || busy} onClick={finalizeLeague}
                      title={!allDone ? "Complete all matches first" : ""}>
                      <FiCheckCircle /> Finalize & Declare Winner
                    </button>
                  )}
                  {league.status === 'active' && (
                    <button className="btn-danger" onClick={deleteLeague}><FiTrash2 /> Delete</button>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 8 }}>
                    {matches.filter(m => m.status === 'completed').length} / {matches.length} matches done
                  </span>
                </div>

                {/* Map Editor */}
                {league.status === 'active' && (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showMapEditor ? 12 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiMap style={{ color: 'var(--cyan)', fontSize: 14 }} />
                        <span style={{ fontWeight: 700, fontSize: 13 }}>Match Maps</span>
                      </div>
                      <button onClick={() => {
                        if (!showMapEditor) {
                          const drafts = {}
                          matches.forEach(m => { drafts[m.match_number] = m.map || "" })
                          setMapDrafts(drafts)
                        }
                        setShowMapEditor(!showMapEditor)
                      }} style={{ background: 'none', border: 'none', color: showMapEditor ? 'var(--text-muted)' : 'var(--cyan)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                        {showMapEditor ? 'Cancel' : 'Edit Maps'}
                      </button>
                    </div>
                    {!showMapEditor ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {matches.map(m => (
                          <span key={m.id} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ color: 'var(--text-muted)' }}>M{m.match_number}:</span>
                            <span style={{ fontWeight: 600, color: m.map ? 'var(--text-primary)' : 'var(--text-muted)' }}>{m.map || 'Not set'}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                          {matches.map(m => (
                            <div key={m.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Match {m.match_number} (Day {m.day})</div>
                              <select value={mapDrafts[m.match_number] || ""} onChange={e => setMapDrafts(prev => ({ ...prev, [m.match_number]: e.target.value }))}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: 6, background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 11, cursor: 'pointer' }}>
                                <option value="">Select Map</option>
                                {BGMI_MAPS.map(map => <option key={map} value={map}>{map}</option>)}
                                <option value="custom">Custom...</option>
                              </select>
                              {mapDrafts[m.match_number] === 'custom' && (
                                <input placeholder="Enter map name" style={{ width: '100%', marginTop: 4, padding: '6px 8px', borderRadius: 6, background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 11 }}
                                  onChange={e => setMapDrafts(prev => ({ ...prev, [m.match_number]: e.target.value }))} />
                              )}
                            </div>
                          ))}
                        </div>
                        <button className="btn-secondary" style={{ fontSize: 12, marginTop: 10 }} disabled={busy} onClick={saveMaps}>
                          {busy ? "Saving..." : "Save Maps"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {standings.length >= 3 && (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiAward style={{ color: 'var(--gold)' }} /> Leaderboard
                    </h3>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                      {standings.slice(0, 3).map((s, i) => (
                        <div key={s.registration_id} style={{
                          flex: 1, minWidth: 140, background: 'var(--bg-surface)', border: '1px solid var(--border)',
                          borderRadius: 12, padding: 14, textAlign: 'center',
                          borderColor: i === 0 ? 'var(--gold)' : i === 1 ? '#c0c0c0' : '#cd7f32'
                        }}>
                          <div style={{ fontSize: 28, marginBottom: 4 }}>{medals[i]}</div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)', marginTop: 4 }}>{s.total_points} pts</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.total_kills} kills · {s.matches_played} matches</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '6px 8px' }}>#</th>
                            <th style={{ padding: '6px 8px' }}>Team</th>
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
                              <td style={{ padding: '6px 8px', fontWeight: i < 3 ? 700 : 400 }}>{i < 3 ? medals[i] : s.rank}</td>
                              <td style={{ padding: '6px 8px', fontWeight: i < 3 ? 700 : 400 }}>{s.name}</td>
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
                )}

                {Object.entries(matchesByDay).sort(([a], [b]) => a - b).map(([dayNum, dayMatches]) => (
                  <div key={dayNum} style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiCalendar size={14} /> Day {dayNum}
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: dayMatches.every(m => m.status === 'completed') ? 'rgba(0,200,120,0.12)' : 'var(--bg-surface)', color: dayMatches.every(m => m.status === 'completed') ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {dayMatches.filter(m => m.status === 'completed').length}/{dayMatches.length}
                      </span>
                    </h4>
                    {dayMatches.map(m => (
                      <MatchCard key={m.id} match={m} isSquad={isSquad} onChanged={() => loadLeague(selected)} />
                    ))}
                  </div>
                ))}

                {league.status === 'completed' && (
                  <div style={{ textAlign: 'center', color: 'var(--green)', padding: 20, fontSize: 15 }}>
                    <FiAward /> League Finalized!
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

export default AdminBGMILeague
