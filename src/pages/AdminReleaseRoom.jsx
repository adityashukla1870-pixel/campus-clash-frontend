import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiMonitor, FiRadio, FiUsers, FiGrid, FiChevronDown } from "react-icons/fi"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"
import { SkeletonText, SkeletonBlock, SkeletonCard } from "../components/Skeleton"

function AdminReleaseRoom() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [selectedId, setSelectedId] = useState("")
  const [roomId, setRoomId] = useState("")
  const [password, setPassword] = useState("")
  const [matchTime, setMatchTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [teams, setTeams] = useState([])
  const [teamsLoading, setTeamsLoading] = useState(false)
  const [slotAssignments, setSlotAssignments] = useState({})
  const [showSlots, setShowSlots] = useState(false)
  const [slotLimit, setSlotLimit] = useState(10)

  useEffect(() => {
    API.get("/tournament/all").then(res => setTournaments(res.data)).catch(console.error).finally(() => setInitialLoading(false))
  }, [])

  const fetchTeams = async (tournamentId) => {
    setTeamsLoading(true)
    try {
      const res = await API.get(`/tournament/admin/${tournamentId}/approved-teams`)
      setTeams(res.data.teams || [])
      setShowSlots(true)
      const teamCount = res.data.teams?.length || 10
      setSlotLimit(Math.max(teamCount, 10))
      const roomRes = await API.get(`/tournament/room/${tournamentId}`)
      setSlotAssignments(roomRes.data.slot_assignments || {})
    } catch {
      alert("Failed to load teams")
    } finally {
      setTeamsLoading(false)
    }
  }

  const handleTournamentChange = (e) => {
    const id = e.target.value
    setSelectedId(id)
    setTeams([])
    setShowSlots(false)
    setSlotAssignments({})
    if (id) {
      fetchTeams(id)
    }
  }

  const handleSlotChange = (slot, registrationId) => {
    const newAssignments = { ...slotAssignments }
    if (registrationId) {
      // Check if this team is already assigned to another slot
      const existingSlot = Object.entries(newAssignments).find(([s, r]) => r === registrationId && s !== slot)
      if (existingSlot) {
        // Remove from previous slot
        delete newAssignments[existingSlot[0]]
      }
      newAssignments[slot] = registrationId
    } else {
      delete newAssignments[slot]
    }
    setSlotAssignments(newAssignments)
  }

  const handleSubmit = async () => {
    if (!selectedId) return
    setLoading(true)
    try {
      await API.post(`/tournament/admin/release-room/${selectedId}`, {
        room_id: roomId,
        password,
        start_time: new Date(matchTime).toISOString(),
        slot_assignments: slotAssignments
      })
      alert("Room Released")
    } catch { alert("Failed to release room") }
    finally { setLoading(false) }
  }

  const handleUpdateSlots = async () => {
    if (!selectedId) return
    setLoading(true)
    try {
      await API.post(`/tournament/admin/update-slots/${selectedId}`, {
        slot_assignments: slotAssignments
      })
      alert("Slots updated!")
    } catch { alert("Failed to update slots") }
    finally { setLoading(false) }
  }

  const pageStyle = { minHeight:'100vh', background:'var(--bg-dark)', padding:'40px 24px' }
  const innerStyle = { maxWidth:720, margin:'0 auto' }

  const slots = Array.from({ length: slotLimit }, (_, i) => i + 1)

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <AdminTopBar />
        {initialLoading ? (
          <>
            <SkeletonText width="180px" height={28} style={{ marginBottom: 6 }} />
            <SkeletonText width="300px" height={14} style={{ marginBottom: 32 }} />
            <SkeletonBlock height={200} style={{ borderRadius: 20, marginBottom: 24 }} />
            <SkeletonCard height={180} />
          </>
        ) : (
          <>
            <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:6}}><FiMonitor /> Release Room</h1>
            <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:32}}>Share room credentials with registered players. Assign teams to lobby slots (1-{slotLimit}).</p>

            <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:20,padding:32,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(135deg,#06b6d4,#22d3ee)'}}/>
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div className="field-group">
                  <label>Tournament</label>
                  <select value={selectedId} onChange={handleTournamentChange}>
                    <option value="">Select tournament...</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="field-group">
                  <label>Room ID</label>
                  <input placeholder="Enter game room ID" onChange={e => setRoomId(e.target.value)} />
                </div>

                <div className="field-group">
                  <label>Password</label>
                  <input placeholder="Enter room password" onChange={e => setPassword(e.target.value)} />
                </div>

                <div className="field-group">
                  <label>Match Start Time</label>
                  <input type="datetime-local" onChange={e => setMatchTime(e.target.value)} />
                </div>

                {/* Slot Assignment Section */}
                {showSlots && (
                  <div style={{borderTop:'1px solid var(--border)',paddingTop:20,marginTop:10}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                      <h3 style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:600,margin:0}}><FiUsers /> Lobby Slot Assignment</h3>
                      <span style={{fontSize:12,color:'var(--text-muted)'}}>{Object.keys(slotAssignments).length}/{slotLimit} slots filled</span>
                    </div>
                    {teamsLoading ? (
                      <div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>Loading teams...</div>
                    ) : teams.length === 0 ? (
                      <div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>No approved teams found for this tournament</div>
                    ) : (
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
                        {slots.map(slot => (
                          <div key={slot} style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px'}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                              <span style={{fontSize:11,fontWeight:700,color:'var(--cyan)',textTransform:'uppercase',letterSpacing:0.5}}>Slot {slot}</span>
                              <span style={{fontSize:11,color:slotAssignments[slot] ? 'var(--green)' : 'var(--text-muted)'}}>
                                {slotAssignments[slot] ? 'Assigned' : 'Empty'}
                              </span>
                            </div>
                            <select
                              value={slotAssignments[slot] || ""}
                              onChange={(e) => handleSlotChange(String(slot), e.target.value || null)}
                              style={{
                                width:'100%',padding:'10px 12px',borderRadius:8,
                                background:'var(--bg-dark)',border:'1px solid var(--border)',
                                color:'var(--text-primary)',fontSize:13,
                                cursor:'pointer',appearance:'none'
                              }}
                            >
                              <option value="">— Select Team —</option>
                              {teams.map(team => (
                                <option key={team.registration_id} value={team.registration_id}>
                                  {team.team_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button className="btn-primary" style={{width:'100%',justifyContent:'center',marginTop:4}} onClick={handleSubmit} disabled={loading || !selectedId || !roomId || !password}>
                  {loading ? "Releasing..." : <><FiRadio /> Release Room</>}
                </button>
                {showSlots && (
                  <button className="btn-secondary" style={{width:'100%',justifyContent:'center',marginTop:8}} onClick={handleUpdateSlots} disabled={loading || !selectedId}>
                    {loading ? "Updating..." : <><FiGrid /> Update Slots Only</>}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminReleaseRoom