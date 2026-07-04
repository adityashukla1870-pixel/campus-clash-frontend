import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import "./TournamentDetails.css"

function TournamentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [paymentCode, setPaymentCode] = useState("")
  const [utr, setUtr] = useState("")
  const [file, setFile] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    API.get(`/tournament/${id}`).then(res => setTournament(res.data)).catch(console.error)
    API.post(`/tournament/register/${id}`).then(res => {
      setPaymentCode(res.data.payment_code)
    })
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpload = async () => {
    if (!file || !utr) { alert("Upload screenshot and enter UTR"); return }
    setLoading(true)
    try {
      const res1 = await API.post(`/tournament/register/${id}`)
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

  const fillPct = Math.round((tournament.players.length / tournament.max_players) * 100)

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

          {/* Payment section */}
          <div className="section-card">
            <h2>💳 Payment Details</h2>
            <div className="upi-row">
              <span>UPI ID</span>
              <strong>campus@upi</strong>
            </div>
            <div className="upi-row">
              <span>Amount to pay</span>
              <strong style={{color:'var(--gold)'}}>₹{tournament.entry_fee}</strong>
            </div>

            <div className="payment-code-box">
              <div className="code-label">🔑 Your Payment Code</div>
              <div className="code-value">{paymentCode || "Generating..."}</div>
              <div className="code-note">⚠️ Add this code in the UPI payment remarks/note</div>
              <button className="btn-secondary" onClick={handleCopy} style={{fontSize:14,padding:'8px 20px'}}>
                {copied ? "✅ Copied!" : "Copy Code"}
              </button>
            </div>
          </div>

          {/* Upload section */}
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
        </div>
      </div>
    </>
  )
}

export default TournamentDetails
