import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"

function AdminCreateTournament() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [entryFee, setEntryFee] = useState("")
  const [date, setDate] = useState("")
  const [maxPlayers, setMaxPlayers] = useState("")
  const [game, setGame] = useState("")
  const [prizePool, setPrizePool] = useState("")
  const [prizeDistribution, setPrizeDistribution] = useState({ "1": 50, "2": 30, "3": 20 })
  const [mode, setMode] = useState("solo")
  const [teamSize, setTeamSize] = useState("4")
  const [format, setFormat] = useState("quick")
  const [pointsTable, setPointsTable] = useState({ "1": 10, "2": 6, "3": 5, "4": 4, "5": 3, "6": 2, "7": 2, "8": 1, "9": 1 })
  const [killPoint, setKillPoint] = useState("1")
  const [structure, setStructure] = useState("group_playoff")
  const [seedStrategy, setSeedStrategy] = useState("random")
  const [bannerImage, setBannerImage] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleBannerChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) { setBannerImage(null); setBannerPreview(null); return }
    setBannerImage(f)
    setBannerPreview(URL.createObjectURL(f))
  }

  // ---- Prize distribution helpers ----
  const prizeTotalPercent = Object.values(prizeDistribution).reduce((sum, v) => sum + Number(v || 0), 0)

  const addPrizeRank = () => {
    const nextRank = String(Object.keys(prizeDistribution).length + 1)
    setPrizeDistribution({ ...prizeDistribution, [nextRank]: 0 })
  }
  const removePrizeRank = (rank) => {
    const next = { ...prizeDistribution }
    delete next[rank]
    setPrizeDistribution(next)
  }
  const updatePrizeRank = (rank, value) => {
    setPrizeDistribution({ ...prizeDistribution, [rank]: Number(value) })
  }
  const amountForRank = (percent) => {
    const pool = Number(prizePool) || 0
    return Math.round((pool * Number(percent || 0)) / 100)
  }

  const handleSubmit = async () => {
    if (Math.round(prizeTotalPercent) !== 100) {
      alert(`Prize distribution must add up to 100% (currently ${prizeTotalPercent}%)`)
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("game", game)
      formData.append("entry_fee", Number(entryFee))
      formData.append("prize_pool", Number(prizePool))
      formData.append("prize_distribution", JSON.stringify(prizeDistribution))
      formData.append("max_players", Number(maxPlayers))
      formData.append("mode", mode)
      formData.append("team_size", mode === "squad" ? Number(teamSize) : 1)
      formData.append("format", format)
      formData.append("structure", structure)
      formData.append("seed_strategy", seedStrategy)
      if (format === "full") {
        formData.append("points_table", JSON.stringify(pointsTable))
        formData.append("kill_point_value", Number(killPoint))
      }
      if (bannerImage) {
        formData.append("banner_image", bannerImage)
      }

      const res = await API.post("/tournament/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      alert(res.data.message || res.data.error)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create tournament")
    } finally {
      setLoading(false)
    }
  }

  const pageStyle = { minHeight:'100vh', background:'var(--bg-dark)', padding:'40px 24px' }
  const innerStyle = { maxWidth:560, margin:'0 auto' }
  const modeBtnStyle = (active) => ({
    flex: 1, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
    border: `1px solid ${active ? 'var(--purple)' : 'var(--border)'}`,
    background: active ? 'var(--purple-glow)' : 'var(--bg-surface)',
    color: active ? 'var(--purple-light)' : 'var(--text-secondary)',
    fontWeight: 600, transition: 'all 0.2s',
  })

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:32}}>
          <AdminTopBar />
        </div>

        <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:6}}>🏆 Create Tournament</h1>
        <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:32}}>Fill in the details to launch a new tournament.</p>

        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:20, padding:32, position:'relative', overflow:'hidden',
        }}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(135deg,#7c3aed,#a855f7)'}}/>

          <div style={{display:'flex', flexDirection:'column', gap:20}}>
            <div className="field-group">
              <label>Tournament Name</label>
              <input placeholder="e.g. BGMI College League S1" onChange={e => setName(e.target.value)} />
            </div>
            <div className="field-group">
              <label>Game</label>
              <input placeholder="e.g. BGMI, Free Fire, Valorant" onChange={e => setGame(e.target.value)} />
            </div>

            <div className="field-group">
              <label>Banner Image <span style={{color:'var(--text-muted)', fontWeight:400}}>(optional)</span></label>
              <input type="file" accept="image/*" onChange={handleBannerChange} />
              <p style={{fontSize:12, color:'var(--text-muted)', marginTop:6}}>
                Shown on the tournament card and details page. Landscape images work best.
              </p>
              {bannerPreview && (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  style={{width:'100%', height:160, objectFit:'cover', borderRadius:10, marginTop:10, border:'1px solid var(--border)'}}
                />
              )}
            </div>

            <div className="field-group">
              <label>Registration Mode</label>
              <div style={{display:'flex', gap:10}}>
                <div style={modeBtnStyle(mode === 'solo')} onClick={() => setMode('solo')}>🧍 Solo</div>
                <div style={modeBtnStyle(mode === 'squad')} onClick={() => setMode('squad')}>👥 Squad</div>
              </div>
            </div>

            <div className="field-group">
              <label>Tournament Format</label>
              <div style={{display:'flex', gap:10}}>
                <div style={modeBtnStyle(format === 'quick')} onClick={() => setFormat('quick')}>
                  ⚡ Quick Match
                </div>
                <div style={modeBtnStyle(format === 'full')} onClick={() => setFormat('full')}>
                  🏟️ Full Tournament
                </div>
              </div>
              <p style={{fontSize:12, color:'var(--text-muted)', marginTop:8}}>
                {format === 'quick'
                  ? "Single room + one winner — same as before, good for casual matches."
                  : "Groups → Playoffs → Finals with a points-based leaderboard. Manage stages after creating."}
              </p>
            </div>

            {format === 'full' && (
              <div className="field-group">
                <label>Stage Structure</label>
                <select value={structure} onChange={e => setStructure(e.target.value)}>
                  <option value="group_playoff">Groups → Playoffs → Finals</option>
                  <option value="single_elimination">Single elimination</option>
                </select>
                <p style={{fontSize:12, color:'var(--text-muted)', marginTop:8}}>
                  Choose the overall competition flow. Grouped stages are better for campus qualifiers, while single-elimination is great for playoffs.
                </p>
                <label style={{ marginTop: 12 }}>Seed Strategy</label>
                <select value={seedStrategy} onChange={e => setSeedStrategy(e.target.value)}>
                  <option value="random">Random draw</option>
                  <option value="snake">Snake seeding</option>
                </select>
                <label>Placement Points (per match)</label>
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, marginBottom:10}}>
                  {Object.keys(pointsTable).map(place => (
                    <div key={place} style={{display:'flex', alignItems:'center', gap:6}}>
                      <span style={{fontSize:12, color:'var(--text-muted)', width:32}}>#{place}</span>
                      <input
                        type="number"
                        value={pointsTable[place]}
                        onChange={e => setPointsTable({ ...pointsTable, [place]: Number(e.target.value) })}
                        style={{width:'100%'}}
                      />
                    </div>
                  ))}
                </div>
                <label style={{fontSize:13}}>Points per kill</label>
                <input type="number" value={killPoint} onChange={e => setKillPoint(e.target.value)} style={{width:100}} />
                <p style={{fontSize:12, color:'var(--text-muted)', marginTop:8}}>
                  Default is the standard BGMI/Free Fire scale — edit any value if your tournament uses a different system.
                </p>
              </div>
            )}

            {mode === 'squad' && (
              <div className="field-group">
                <label>Team Size (players per squad)</label>
                <input type="number" min="2" placeholder="e.g. 4" value={teamSize} onChange={e => setTeamSize(e.target.value)} />
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div className="field-group">
                <label>Entry Fee (₹)</label>
                <input type="number" placeholder="0" onChange={e => setEntryFee(e.target.value)} />
              </div>
              <div className="field-group">
                <label>Prize Pool (₹)</label>
                <input type="number" placeholder="0" value={prizePool} onChange={e => setPrizePool(e.target.value)} />
              </div>
            </div>

            <div className="field-group">
              <label>
                Prize Distribution
                <span style={{
                  marginLeft: 8, fontWeight: 600, fontSize: 12,
                  color: Math.round(prizeTotalPercent) === 100 ? 'var(--cyan)' : 'var(--red)'
                }}>
                  {prizeTotalPercent}% allocated
                </span>
              </label>
              <p style={{fontSize:12, color:'var(--text-muted)', marginTop:-4, marginBottom:8}}>
                Split the ₹{prizePool || 0} pool across placements. Percentages must total 100%.
              </p>
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {Object.keys(prizeDistribution)
                  .sort((a, b) => Number(a) - Number(b))
                  .map(rank => (
                    <div key={rank} style={{display:'flex', alignItems:'center', gap:8}}>
                      <span style={{fontSize:12, color:'var(--text-muted)', width:36}}>#{rank}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={prizeDistribution[rank]}
                        onChange={e => updatePrizeRank(rank, e.target.value)}
                        style={{width:80}}
                      />
                      <span style={{fontSize:12, color:'var(--text-muted)'}}>%</span>
                      <span style={{fontSize:13, color:'var(--gold)', fontWeight:600, marginLeft:'auto'}}>
                        ₹{amountForRank(prizeDistribution[rank]).toLocaleString()}
                      </span>
                      {Object.keys(prizeDistribution).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrizeRank(rank)}
                          style={{background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16, padding:'0 4px'}}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
              </div>
              <button
                type="button"
                onClick={addPrizeRank}
                style={{
                  marginTop:10, background:'var(--bg-surface)', border:'1px solid var(--border)',
                  color:'var(--text-secondary)', borderRadius:8, padding:'6px 12px', fontSize:12,
                  cursor:'pointer', width:'fit-content',
                }}
              >
                + Add Placement
              </button>
            </div>

            <div className="field-group">
              <label>{mode === 'squad' ? 'Max Teams' : 'Max Players'}</label>
              <input type="number" placeholder="e.g. 100" onChange={e => setMaxPlayers(e.target.value)} />
            </div>
            <div className="field-group">
              <label>Tournament Date</label>
              <input type="datetime-local" onChange={e => setDate(e.target.value)} />
            </div>

            <button className="btn-primary" style={{width:'100%',justifyContent:'center',marginTop:4}} onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "🚀 Create Tournament"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCreateTournament
