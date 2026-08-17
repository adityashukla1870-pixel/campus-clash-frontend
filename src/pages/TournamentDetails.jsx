import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"
import { FiUpload, FiUsers, FiTarget, FiCreditCard, FiBarChart2, FiCheckCircle, FiZap } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { resolveImageUrl } from "../utils/media"
import { SkeletonBlock, SkeletonText, SkeletonCard, SkeletonForm, SkeletonRoom, SkeletonBadge } from "../components/Skeleton"
import RegistrationTimer from "../components/RegistrationTimer"
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
  const [teamLeader, setTeamLeader] = useState({ name: "", game_uid: "", contact: "" })
  const [members, setMembers] = useState([])
  const [teamConfirmed, setTeamConfirmed] = useState(false)
  const [teamLoading, setTeamLoading] = useState(false)
  const [myGroup, setMyGroup] = useState(null)

  useEffect(() => {
    API.get(`/tournament/${id}`).then(res => {
      const t = res.data
      setTournament(t)
      if (t.mode === "squad") {
        setMembers(Array.from({ length: Math.max(t.team_size - 1, 0) }, () => ({ name: "", game_uid: "" })))
      } else {
        // solo tournaments register immediately to reserve a payment code
        API.post(`/tournament/register/${id}`, {}).then(r => setPaymentCode(r.data.payment_code)).catch(() => {})
      }
    }).catch(console.error)

    // Which group/pod did I land in, if grouping already happened?
    API.get(`/stages/tournament/${id}/my-group`).then(res => setMyGroup(res.data.group)).catch(() => setMyGroup(null))
  }, [id])

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updateMember = (index, field, value) => {
    setMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const updateLeader = (field, value) => {
    setTeamLeader(prev => ({ ...prev, [field]: value }))
  }

  const handleConfirmTeam = async () => {
    if (!teamName.trim()) { alert("Enter your team name"); return }
    if (!teamLeader.name.trim()) { alert("Enter the team leader's name"); return }
    if (!teamLeader.game_uid.trim()) { alert("Enter the team leader's game UID"); return }
    if (!teamLeader.contact.trim()) { alert("Enter the team leader's contact number"); return }
    const incomplete = members.some(m => !m.name.trim() || !m.game_uid.trim())
    if (incomplete) { alert("Enter name and game UID for all teammates"); return }

    setTeamLoading(true)
    try {
      const res = await API.post(`/tournament/register/${id}`, {
        team_name: teamName,
        team_leader: teamLeader,
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
      const res1 = await API.post(`/tournament/register/${id}`, tournament.mode === "squad" ? { team_name: teamName, team_leader: teamLeader, team_members: members } : {})
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
        <div className="details-page">
          <div className="details-inner">
            <SkeletonBlock height={200} style={{ borderRadius: 16, marginBottom: 24 }} />
            <div className="details-header">
              <SkeletonText width="150px" height={14} style={{ marginBottom: 8 }} />
              <SkeletonText width="300px" height={32} style={{ marginBottom: 16 }} />
              <div className="details-badges" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <SkeletonBadge width={80} />
                <SkeletonBadge width={120} />
                <SkeletonBadge width={160} />
              </div>
            </div>
            <div className="details-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, marginTop: 24 }}>
              <div className="details-main">
                <SkeletonCard height={280} />
                <SkeletonForm fields={4} style={{ marginTop: 20 }} />
              </div>
              <div className="details-sidebar">
                <SkeletonRoom />
                <SkeletonCard height={200} style={{ marginTop: 20 }} />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const isSquad = tournament.mode === "squad"
  const canPay = !isSquad || teamConfirmed

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

          {tournament.banner_image && (
            <div
              className="details-banner-image"
              style={{ backgroundImage: `url(${resolveImageUrl(tournament.banner_image)})` }}
            />
          )}

          {myGroup && (
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed22, #a855f722)', border: '1px solid var(--purple)',
              borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
            }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-muted)', marginBottom: 2 }}>
                  Your Group — {myGroup.stage_name}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--purple-light)' }}>
                  🏷️ {myGroup.pod_name}
                </div>
                {myGroup.teammates?.length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    With: {myGroup.teammates.join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="details-header">
            <div className="details-eyebrow">Tournament Details</div>
            <h1 className="details-title">{tournament.name}</h1>
            <div className="details-badges">
              <span className="details-badge">🎮 {tournament.game}</span>
              <span className={`details-badge ${isSquad ? 'cyan' : 'purple'}`}>
                {isSquad ? `👥 Squad — Team of ${tournament.team_size}` : '🧍 Solo'}
              </span>
              <span className={`details-badge ${tournament.format === 'full' ? 'gold' : 'cyan'}`}>
                {tournament.format === 'full' ? '🏅 Multi-Stage Tournament' : '⚡ Quick Match'}
              </span>
              {tournament.format === "full" && (
                <span
                  className="details-badge details-badge-action"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/tournament/${id}/standings`)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(`/tournament/${id}/standings`)}
                >
                  <FiBarChart2 size={13} /> View Standings
                </span>
              )}
            </div>
            {tournament.scheduled_time && (
              <div className="details-scheduled">
                <FiZap size={12} /> Starts: {new Date(tournament.scheduled_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(tournament.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          <div className="details-layout">
            {/* ---------------- Main column ---------------- */}
            <div className="details-main">
              <div className="info-grid">
                <div className="info-grid-item">
                  <div className="ig-label">Entry Fee</div>
                  <div className="ig-value">₹{tournament.entry_fee}</div>
                </div>
                <div className="info-grid-item">
                  <div className="ig-label">Prize Pool</div>
                  <div className="ig-value gold">₹{tournament.prize_pool}</div>
                </div>
                <div className="info-grid-item" style={{ gridColumn: '1/-1' }}>
                  <div className="ig-label">Players Registered — {tournament.players.length}</div>
                </div>
              </div>

              {/* Registration timer — shows when registration closes */}
              <RegistrationTimer deadline={tournament.registration_end_time} />

              {/* Prize breakdown — how the pool splits across placements */}
              {tournament.prize_breakdown?.length > 0 && (
                <div className="section-card">
                  <h2>🏆 Prize Breakdown</h2>
                  <p className="section-subtext">How the ₹{tournament.prize_pool} pool is split across placements.</p>
                  <div className="scoring-grid">
                    {tournament.prize_breakdown.map((row) => (
                      <div className="scoring-chip" key={row.rank}>
                        <div className="scoring-chip-rank">
                          {row.rank === "1" ? "🥇 #1" : row.rank === "2" ? "🥈 #2" : row.rank === "3" ? "🥉 #3" : `#${row.rank}`}
                        </div>
                        <div className="scoring-chip-pts">₹{row.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scoring system — visible to users so they know the rules before joining */}
              {tournament.points_table && (
                <div className="section-card">
                  <h2><FiTarget size={17} /> Scoring System</h2>
                  <p className="section-subtext">
                    {tournament.format === 'full'
                      ? 'Points are earned from your placement rank and every kill across matches.'
                      : 'Points are earned from your placement rank and every kill in the match.'}
                  </p>
                  <div className="scoring-grid">
                    {Object.entries(tournament.points_table)
                      .sort((a, b) => Number(a[0]) - Number(b[0]))
                      .map(([rank, pts]) => (
                        <div className="scoring-chip" key={rank}>
                          <div className="scoring-chip-rank">#{rank}</div>
                          <div className="scoring-chip-pts">{pts} pts</div>
                        </div>
                      ))}
                  </div>
                  <div className="kill-points-row">
                    <span>🔫 Per Kill</span>
                    <strong>{tournament.kill_point_value} {tournament.kill_point_value === 1 ? 'point' : 'points'}</strong>
                  </div>
                </div>
              )}

              {/* Team registration section (squad mode only) */}
              {isSquad && (
                <div className="section-card">
                  <h2><FiUsers size={17} /> Team Details</h2>
                  <div className="field-group">
                    <label>Team Name</label>
                    <input
                      type="text"
                      placeholder="Enter your squad name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      disabled={teamConfirmed}
                    />
                  </div>

                  <div className="team-member-row">
                    <div className="field-group">
                      <label>Team Leader Name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={teamLeader.name}
                        onChange={(e) => updateLeader("name", e.target.value)}
                        disabled={teamConfirmed}
                      />
                    </div>
                    <div className="field-group">
                      <label>Team Leader Game UID</label>
                      <input
                        type="text"
                        placeholder="Your in-game ID"
                        value={teamLeader.game_uid}
                        onChange={(e) => updateLeader("game_uid", e.target.value)}
                        disabled={teamConfirmed}
                      />
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Team Leader Contact Number</label>
                    <input
                      type="tel"
                      placeholder="Reachable phone number"
                      value={teamLeader.contact}
                      onChange={(e) => updateLeader("contact", e.target.value)}
                      disabled={teamConfirmed}
                    />
                  </div>

                  {members.map((m, i) => (
                    <div key={i} className="team-member-row">
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
                        <label>Teammate {i + 1} Game UID</label>
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
                    <button className="btn-primary chamfer-sm details-cta" onClick={handleConfirmTeam} disabled={teamLoading}>
                      {teamLoading ? "Confirming..." : "Confirm Team & Get Payment Code"}
                    </button>
                  ) : (
                    <div className="team-confirmed-note">
                      <FiCheckCircle size={16} /> Team "{teamName}" confirmed — led by {teamLeader.name}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ---------------- Sidebar: payment ---------------- */}
            {canPay && (
              <div className="details-sidebar">
                <div className="section-card payment-card">
                  <h2><FiCreditCard size={17} /> Payment Details</h2>
                  <div className="upi-row">
                    <span>UPI ID</span>
                    <strong>7052759580@ptyes</strong>
                  </div>
                  <div className="upi-row">
                    <span>Amount to pay</span>
                    <strong className="gold-text">₹{tournament.entry_fee}</strong>
                  </div>

                  <div className="payment-code-box">
                    {upiLink && (
                      <div className="qr-wrap">
                        <QRCodeSVG value={upiLink} size={172} />
                      </div>
                    )}
                    <div className="code-note">📱 Scan to pay ₹{tournament.entry_fee} — amount &amp; code auto-filled</div>
                    <div className="code-label">🔑 Your Payment Code</div>
                    <div className="code-value">{paymentCode || "Generating..."}</div>
                    <div className="code-note">⚠️ Add this code in the UPI payment remarks/note</div>
                    <button className="btn-secondary" onClick={handleCopy}>
                      {copied ? "✅ Copied!" : "Copy Code"}
                    </button>
                  </div>
                </div>

                <div className="section-card">
                  <h2><FiUpload size={17} /> Submit Payment Proof</h2>

                  <div className="upload-area">
                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                    <FiUpload className="upload-icon" size={26} />
                    <p>Click to upload payment screenshot</p>
                    {file && <div className="file-name">✅ {file.name}</div>}
                  </div>

                  <div className="field-group">
                    <label>UTR / Reference Number</label>
                    <input
                      type="text"
                      placeholder="Enter UPI transaction UTR"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                    />
                  </div>

                  <button className="btn-primary chamfer-sm details-cta" onClick={handleUpload} disabled={loading}>
                    {loading ? "Submitting..." : "🚀 Submit Payment"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default TournamentDetails
