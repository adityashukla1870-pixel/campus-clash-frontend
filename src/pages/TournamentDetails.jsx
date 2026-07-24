import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft, Gamepad2, IndianRupee, CreditCard, Copy, Check,
  Upload, FileImage, Loader2, AlertTriangle,
} from "lucide-react"
import Navbar from "../components/Navbar"
import LoadingScreen from "../components/LoadingScreen"
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
  }, [id])

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
        <LoadingScreen message="Loading tournament..." />
      </>
    )
  }

  const fillPct = Math.round((tournament.players.length / tournament.max_players) * 100)

  return (
    <>
      <Navbar />
      <div className="details-page">
        <motion.div
          className="details-inner"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <button className="details-back" onClick={() => navigate("/tournaments")}>
            <ArrowLeft size={16} />
            Back to Tournaments
          </button>

          <div className="details-header">
            <div>
              <div className="details-title">{tournament.name}</div>
              <span className="details-game-badge">
                <Gamepad2 size={12} />
                {tournament.game}
              </span>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-grid-item glass-card-static">
              <IndianRupee size={16} className="ig-icon" />
              <div className="ig-label">Entry Fee</div>
              <div className="ig-value">₹{tournament.entry_fee}</div>
            </div>
            <div className="info-grid-item glass-card-static">
              <IndianRupee size={16} className="ig-icon gold" />
              <div className="ig-label">Prize Pool</div>
              <div className="ig-value gold">₹{tournament.prize_pool}</div>
            </div>
            <div className="info-grid-item glass-card-static full-width">
              <div className="ig-label">Players — {tournament.players.length} / {tournament.max_players}</div>
              <div className="details-bar-track">
                <motion.div
                  className="details-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>

          <div className="section-card glass-card-static accent-top-purple">
            <h2><CreditCard size={20} /> Payment Details</h2>
            <div className="upi-row">
              <span>UPI ID</span>
              <strong>campus@upi</strong>
            </div>
            <div className="upi-row">
              <span>Amount to pay</span>
              <strong className="gold-text">₹{tournament.entry_fee}</strong>
            </div>

            <div className="payment-code-box">
              <div className="code-label">Your Payment Code</div>
              <div className="code-value">{paymentCode || "Generating..."}</div>
              <div className="code-note">
                <AlertTriangle size={14} />
                Add this code in the UPI payment remarks/note
              </div>
              <button className="btn-secondary copy-btn" onClick={handleCopy}>
                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Code</>}
              </button>
            </div>
          </div>

          <div className="section-card glass-card-static accent-top-cyan">
            <h2><Upload size={20} /> Submit Payment Proof</h2>

            <div className="upload-area">
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
              <FileImage size={32} className="upload-icon" />
              <p>Click to upload payment screenshot</p>
              {file && (
                <div className="file-name">
                  <Check size={14} />
                  {file.name}
                </div>
              )}
            </div>

            <div className="field-group" style={{ marginBottom: 20 }}>
              <label>UTR / Reference Number</label>
              <input
                type="text"
                placeholder="Enter UPI transaction UTR"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
              />
            </div>

            <button
              className="btn-primary submit-btn"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={18} className="spin" /> Submitting...</>
              ) : (
                "Submit Payment"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default TournamentDetails
