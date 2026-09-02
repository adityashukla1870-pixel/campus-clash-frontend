import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { FiFlag, FiCheckCircle, FiClock, FiTarget, FiUsers, FiMonitor, FiAward, FiHeart, FiSend, FiMessageSquare, FiStar, FiX } from "react-icons/fi"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import PlayerProfileCard from "../components/PlayerProfileCard"
import FeedbackLauncher from "../components/FeedbackLauncher"
import { SkeletonCard, SkeletonText } from "../components/Skeleton"
import "./MyTournament.css"

function MyTournaments() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedbackModal, setFeedbackModal] = useState(null)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackHover, setFeedbackHover] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState("")
  const [myFeedbacks, setMyFeedbacks] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/"); return }
    API.get("/tournament/my-tournaments")
      .then(res => setTournaments(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false))
  }, [location.pathname])

  useEffect(() => {
    API.get("/feedbacks/mine")
      .then(res => setMyFeedbacks(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
  }, [])

  const hasFeedback = (tournamentId) => myFeedbacks.some(f => f.tournament_id === tournamentId)

  const openFeedback = (tournament) => {
    setFeedbackModal(tournament)
    setFeedbackRating(0)
    setFeedbackHover(0)
    setFeedbackComment("")
    setFeedbackSuccess(false)
    setFeedbackError("")
  }

  const submitFeedback = async () => {
    if (feedbackRating === 0) { setFeedbackError("Please select a rating"); return }
    setFeedbackSubmitting(true)
    setFeedbackError("")
    try {
      await API.post("/feedbacks", {
        tournament_id: feedbackModal.id,
        rating: feedbackRating,
        comment: feedbackComment,
      })
      setFeedbackSuccess(true)
      setMyFeedbacks(prev => [...prev, {
        tournament_id: feedbackModal.id,
        rating: feedbackRating,
        comment: feedbackComment,
        status: "pending",
      }])
    } catch (err) {
      setFeedbackError(err.response?.data?.error || "Failed to submit feedback")
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mytournaments-page">
          <div className="mytournaments-inner">
            <SkeletonText width="200px" height={14} style={{ marginBottom: 8 }} />
            <SkeletonText width="250px" height={32} style={{ marginBottom: 16 }} />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </>
    )
  }

  const statusChip = (status) => {
    if (status === "completed") return <span className="chip-completed"><FiFlag /> Completed</span>
    if (status === "approved") return <span className="chip-approved"><FiCheckCircle /> Approved</span>
    if (status === "teammate") return <span className="chip-pending"><FiUsers /> Teammate</span>
    return <span className="chip-pending"><FiClock /> Pending</span>
  }

  return (
    <>
      <Navbar />
      <FeedbackLauncher />
      <div className="mytournaments-page">
        <div className="mytournaments-inner">
          <span className="uppercase-label">Elite Match History</span>
          <h1 className="page-title mt-page-title">My <span>Matches</span></h1>
          <div className="glow-line"></div>

          {tournaments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FiTarget /></div>
              <p>You haven't joined any tournaments yet. Go find a battle!</p>
            </div>
          ) : (
            <div className="mytournament-list">
              {tournaments.map((t) => (
                <div className="mytournament-card glass-panel chamfer hover-lift" key={t.id}>
                  <div className="mt-card-top">
                    <h2>{t.name}</h2>
                    {statusChip(t.status)}
                  </div>

                  <div className="mt-meta">
                    {t.team_name && (
                      <div className="mt-meta-item">
                        <span className="meta-label uppercase-label">Team</span>
                        <span className="meta-value"><FiUsers /> {t.team_name}</span>
                        {t.role && (
                          <span style={{
                            marginLeft: 6, fontSize: 10, padding: '2px 6px',
                            borderRadius: 4, fontWeight: 600, textTransform: 'uppercase',
                            background: t.role === 'leader' ? 'rgba(124,58,237,0.2)' : 'rgba(34,197,94,0.2)',
                            color: t.role === 'leader' ? 'var(--purple-light)' : 'var(--green)',
                            border: `1px solid ${t.role === 'leader' ? 'var(--purple)' : 'var(--green)'}33`
                          }}>
                            {t.role === 'leader' ? 'Leader' : 'Member'}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-meta-item">
                      <span className="meta-label uppercase-label">Game</span>
                      <span className="meta-value"><FiMonitor /> {t.game}</span>
                    </div>
                    <div className="mt-meta-item">
                      <span className="meta-label uppercase-label">Entry Fee</span>
                      <span className="meta-value">₹{t.entry_fee}</span>
                    </div>
                    <div className="mt-meta-item">
                      <span className="meta-label uppercase-label">Prize Pool</span>
                      <span className="meta-value gold">₹{t.prize_pool}</span>
                    </div>
                  </div>

                  {t.status === "completed" && (
                    <div className={`winner-banner${t.is_winner ? '' : ' loser'}`}>
                      {t.is_winner ? (
                        <>
                          <p style={{color:'var(--green)'}}>You won this tournament!</p>
                          <div className="winner-name">Congratulations, champion.</div>
                        </>
                      ) : (
                        <>
                          <p style={{color:'var(--yellow)'}}><FiHeart /> Better luck next time</p>
                          <div className="winner-name pp-clickable" onClick={(e) => t.winner_id && setSelectedProfile({ userId: t.winner_id, rect: e.currentTarget.getBoundingClientRect() })}>Winner: {t.winner}</div>
                        </>
                      )}
                    </div>
                  )}

                  {t.status !== "completed" && (
                    <div className="mt-action" style={{display:'flex', gap:10, flexWrap:'wrap'}}>
                      {t.role === 'teammate' && t.status === 'teammate' ? (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>
                          Waiting for leader to submit proof...
                        </span>
                      ) : (
                        <>
                           <button
                            className="btn-primary shimmer-wrap"
                            onClick={() => navigate(`/room/${t.id}`)}
                            disabled={t.status !== "approved"}
                            style={t.status !== "approved" ? {opacity:0.4,cursor:'not-allowed'} : {}}
                          >
                            {t.status === "approved" ? <><FiSend /> Show Details</> : <><FiClock /> Awaiting Approval</>}
                          </button>
                          {t.has_bracket && t.format !== 'full' && (
                            <button className="btn-primary" onClick={() => navigate(`/tournament/${t.id}/bracket`)}>
                              <FiAward /> Bracket
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {t.status === "completed" && t.has_bracket && t.format !== 'full' && (
                    <div className="mt-action" style={{display:'flex', gap:10, flexWrap:'wrap'}}>
                      <button className="btn-primary" onClick={() => navigate(`/tournament/${t.id}/bracket`)}>
                        <FiAward /> View Final Bracket
                      </button>
                    </div>
                  )}

                  <div className="mt-action" style={{marginTop: 8}}>
                    {hasFeedback(t.id) ? (
                      <button className="btn-feedback btn-feedback-submitted" disabled>
                        <FiCheckCircle /> Feedback Submitted
                      </button>
                    ) : (
                      <button className="btn-feedback" onClick={() => openFeedback(t)}>
                        <FiMessageSquare /> Feedback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {feedbackModal && (
        <div className="feedback-overlay" onClick={() => setFeedbackModal(null)}>
          <div className="feedback-modal" onClick={e => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <h3><FiMessageSquare /> Feedback</h3>
              <button className="feedback-close" onClick={() => setFeedbackModal(null)}><FiX /></button>
            </div>

            {feedbackSuccess ? (
              <div className="feedback-success">
                <FiCheckCircle size={48} />
                <h4>Submit Success!</h4>
                <p>Your feedback for <strong>{feedbackModal.name}</strong> has been submitted. Admin will review it shortly.</p>
                <button className="btn-primary" onClick={() => setFeedbackModal(null)}>Done</button>
              </div>
            ) : (
              <>
                <p className="feedback-tournament-name">{feedbackModal.name}</p>

                <div className="feedback-stars">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      className={`feedback-star ${star <= (feedbackHover || feedbackRating) ? 'active' : ''}`}
                      onClick={() => setFeedbackRating(star)}
                      onMouseEnter={() => setFeedbackHover(star)}
                      onMouseLeave={() => setFeedbackHover(0)}
                    >
                      <FiStar />
                    </button>
                  ))}
                  {feedbackRating > 0 && <span className="feedback-rating-label">{feedbackRating}/5</span>}
                </div>

                <textarea
                  className="feedback-textarea"
                  placeholder="Write your feedback or suggestion..."
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                />

                {feedbackError && <p className="feedback-error">{feedbackError}</p>}

                <button
                  className="btn-primary feedback-submit-btn"
                  onClick={submitFeedback}
                  disabled={feedbackSubmitting || feedbackRating === 0}
                >
                  {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {selectedProfile && (
        <PlayerProfileCard
          userId={selectedProfile.userId}
          anchorRect={selectedProfile.rect}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </>
  )
}

export default MyTournaments
