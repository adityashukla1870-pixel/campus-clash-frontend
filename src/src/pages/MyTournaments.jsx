import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import "./MyTournament.css"

function MyTournaments() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tournaments, setTournaments] = useState([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/"); return }
    API.get("/tournament/my-tournaments")
      .then(res => setTournaments(Array.isArray(res.data) ? res.data : []))
  }, [location.pathname])

  const statusChip = (status) => {
    if (status === "completed") return <span className="chip-completed">Completed 🏁</span>
    if (status === "approved") return <span className="chip-approved">Approved ✅</span>
    return <span className="chip-pending">Pending ⏳</span>
  }

  return (
    <>
      <Navbar />
      <div className="mytournaments-page">
        <div className="mytournaments-inner">
          <h1 className="page-title">My <span>Matches</span></h1>
          <div className="glow-line"></div>

          {tournaments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <p>You haven't joined any tournaments yet. Go find a battle!</p>
            </div>
          ) : (
            <div className="mytournament-list">
              {tournaments.map((t) => (
                <div className="mytournament-card" key={t.id}>
                  <div className="mt-card-top">
                    <h2>{t.name}</h2>
                    {statusChip(t.status)}
                  </div>

                  <div className="mt-meta">
                    <div className="mt-meta-item">
                      <span className="meta-label">Game</span>
                      <span className="meta-value">🎮 {t.game}</span>
                    </div>
                    <div className="mt-meta-item">
                      <span className="meta-label">Entry Fee</span>
                      <span className="meta-value">₹{t.entry_fee}</span>
                    </div>
                    <div className="mt-meta-item">
                      <span className="meta-label">Prize Pool</span>
                      <span className="meta-value gold">₹{t.prize_pool}</span>
                    </div>
                  </div>

                  {t.status === "completed" && (
                    <div className={`winner-banner${t.is_winner ? '' : ' loser'}`}>
                      {t.is_winner ? (
                        <>
                          <p style={{color:'var(--green)'}}>🎉 You won this tournament!</p>
                          <div className="winner-name">Congratulations, champion.</div>
                        </>
                      ) : (
                        <>
                          <p style={{color:'var(--yellow)'}}>❤️ Better luck next time</p>
                          <div className="winner-name">Winner: {t.winner}</div>
                        </>
                      )}
                    </div>
                  )}

                  {t.status !== "completed" && (
                    <div className="mt-action">
                      <button
                        className="btn-primary"
                        onClick={() => navigate(`/room/${t.id}`)}
                        disabled={t.status !== "approved"}
                        style={t.status !== "approved" ? {opacity:0.4,cursor:'not-allowed'} : {}}
                      >
                        {t.status === "approved" ? "🚀 Open Room" : "⏳ Awaiting Approval"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MyTournaments
