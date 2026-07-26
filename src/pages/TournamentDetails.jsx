import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import "./TournamentDetails.css"

const UPI_ID = "7052759580@ptyes"
const PAYEE_NAME = "Campus Clash"

function TournamentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [paymentCode, setPaymentCode] = useState("")
  const [utr, setUtr] = useState("")
  const [file, setFile] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  // Squad mode state
  const [teamName, setTeamName] = useState("")
  const [members, setMembers] = useState([])
  const [teamConfirmed, setTeamConfirmed] = useState(false)
  const [teamLoading, setTeamLoading] = useState(false)

  useEffect(() => {
    API.get(`/tournament/${id}`).then(res => {
      const t = res.data
      setTournament(t)
      if (t.mode === "squad") {
        setMembers(Array.from({ length: Math.max(t.team_size - 1, 0) }, () => ({ name: "", game_uid: "" })))
      } else {
        // solo tournaments register immediately to reserve a payment code
        API.post(`/tournament/register/${id}`, {}).then(r => setPaymentCode(r.data.payment_code))
      }
    }).catch(console.error)
  }, [id])

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updateMember = (index, field, value) => {
    setMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const handleConfirmTeam = async () => {
    if (!teamName.trim()) { alert("Enter your team name"); return }
    const incomplete = members.some(m => !m.name.trim())
    if (incomplete) { alert("Enter names for all teammates"); return }

    setTeamLoading(true)
    try {
      const res = await API.post(`/tournament/register/${id}`, {
        team_name: teamName,
        team_members: members
      })
      setPaymentCode(res.data.payment_code)
      setTeamConfirmed(true)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to register team")
    } finally {
      setTeamLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file || !utr) { alert("Upload screenshot and enter UTR"); return }
    setLoading(true)
    try {
      const res1 = await API.post(`/tournament/register/${id}`, tournament.mode === "squad" ? { team_name: teamName, team_members: members } : {})
      const registrationId = res1.data.registration_id
      if (!registrationId) { alert("Registration failed"); return }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("utr", utr)
      await API.post(`/tournament/upload-payment/${registrationId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      alert("Payment submitted! Waiting for admin approval.")
      navigate("/my-tournaments")
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.msg || "Upload Failed")
    } finally {
      setLoading(false)
    }
  }

  if (!tournament) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop: 120, textAlign: "center", color: "var(--text-secondary)" }}>
          Loading tournament...
        </div>
      </>
    )
  }

  const isSquad = tournament.mode === "squad"
  const canPay = !isSquad || teamConfirmed
  const fillPct = Math.round((tournament.players.length / tournament.max_players) * 100)

  const upiLink = paymentCode
    ? `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${tournament.entry_fee}&tn=${encodeURIComponent(paymentCode)}&cu=INR`
    : ""

  return (
    <>
      <Navbar />
      <div className="details-page">
        <div className="details-inner">
          <div className="details-back" onClick={() => navigate("/tournaments")}>
            ← Back to Tournaments
          </div>

          <div className="details-title">{tournament.name}</div>
          <div className="details-game-badge">🎮 {tournament.game}</div>
          <div className="details-game-badge" style={{marginLeft:8, background: isSquad ? 'var(--cyan-glow)' : 'var(--purple-glow)', color: isSquad ? 'var(--cyan)' : 'var(--purple-light)'}}>
            {isSquad ? `👥 Squad — Team of ${tournament.team_size}` : '🧍 Solo'}
          </div>

          <div className="info-grid">
            <div className="info-grid-item">
              <div className="ig-label">Entry Fee</div>
              <div className="ig-value">₹{tournament.entry_fee}</div>
            </div>
            <div className="info-grid-item">
              <div className="ig-label">Prize Pool</div>
              <div className="ig-value gold">₹{tournament.prize_pool}</div>
            </div>
            <div className="info-grid-item" style={{gridColumn:'1/-1'}}>
              <div className="ig-label">Players — {tournament.players.length} / {tournament.max_players}</div>
              <div style={{marginTop:8, height:6, background:'var(--bg-surface)', borderRadius:3, overflow:'hidden'}}>
                <div style={{width:`${fillPct}%`, height:'100%', background:'var(--grad-purple)', borderRadius:3}} />
              </div>
            </div>
          </div>

          {/* Team registration section (squad mode only) */}
          {isSquad && (
            <div className="section-card">
              <h2>👥 Team Details</h2>
              <div className="field-group" style={{marginBottom:20}}>
                <label>Team Name</label>
                <input
                  type="text"
                  placeholder="Enter your squad name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={teamConfirmed}
                />
              </div>

              {members.map((m, i) => (
                <div key={i} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16}}>
                  <div className="field-group">
                    <label>Teammate {i + 1} Name</label>
                    <input
                      type="text"
                      placeholder="Player name"
                      value={m.name}
                      onChange={(e) => updateMember(i, "name", e.target.value)}
                      disabled={teamConfirmed}
                    />
                  </div>
                  <div className="field-group">
                    <label>Game UID (optional)</label>
                    <input
                      type="text"
                      placeholder="In-game ID"
                      value={m.game_uid}
                      onChange={(e) => updateMember(i, "game_uid", e.target.value)}
                      disabled={teamConfirmed}
                    />
                  </div>
                </div>
              ))}

              {!teamConfirmed ? (
                <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={handleConfirmTeam} disabled={teamLoading}>
                  {teamLoading ? "Confirming..." : "✅ Confirm Team & Get Payment Code"}
                </button>
              ) : (
                <div style={{background:'var(--green-bg)',border:'1px solid #22c55e44',borderRadius:12,padding:14,textAlign:'center',color:'var(--green)',fontWeight:600}}>
                  Team "{teamName}" confirmed
                </div>
              )}
            </div>
          )}

          {/* Payment section */}
          {canPay && (
            <div className="section-card">
              <h2>💳 Payment Details</h2>
              <div className="upi-row">
                <span>UPI ID</span>
                <strong>7052759580@ptyes</strong>
              </div>
              <div className="upi-row">
                <span>Amount to pay</span>
                <strong style={{color:'var(--gold)'}}>₹{tournament.entry_fee}</strong>
              </div>

              <div className="payment-code-box">
                {upiLink && (
                  <div style={{
                    background: "#fff",
                    padding: 14,
                    borderRadius: 12,
                    display: "inline-block",
                    marginBottom: 16
                  }}>
                    <QRCodeSVG value={upiLink} size={180} />
                  </div>
                )}
                <div className="code-note" style={{marginBottom: 10}}>
                  📱 Scan to pay ₹{tournament.entry_fee} — amount &amp; code auto-filled
                </div>
                <div className="code-label">🔑 Your Payment Code</div>
                <div className="code-value">{paymentCode || "Generating..."}</div>
                <div className="code-note">⚠️ Add this code in the UPI payment remarks/note</div>
                <button className="btn-secondary" onClick={handleCopy} style={{fontSize:14,padding:'8px 20px'}}>
                  {copied ? "✅ Copied!" : "Copy Code"}
                </button>
              </div>
            </div>
          )}

          {/* Upload section */}
          {canPay && (
            <div className="section-card">
              <h2>📤 Submit Payment Proof</h2>

              <div className="upload-area">
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                <div className="upload-icon">📁</div>
                <p>Click to upload payment screenshot</p>
                {file && <div className="file-name">✅ {file.name}</div>}
              </div>

              <div className="field-group" style={{marginBottom:20}}>
                <label>UTR / Reference Number</label>
                <input
                  type="text"
                  placeholder="Enter UPI transaction UTR"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                />
              </div>

              <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={handleUpload} disabled={loading}>
                {loading ? "Submitting..." : "🚀 Submit Payment"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TournamentDetails
