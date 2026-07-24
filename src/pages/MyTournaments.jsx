import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Gamepad2, IndianRupee, Trophy, Clock, CheckCircle2,
  Rocket, Target, Crown, Heart,
} from "lucide-react"
import Navbar from "../components/Navbar"
import LoadingScreen from "../components/LoadingScreen"
import API from "../api/axios"
import "./MyTournament.css"

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
}

function MyTournaments() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/"); return }
    API.get("/tournament/my-tournaments")
      .then(res => setTournaments(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false))
  }, [location.pathname, navigate])

  const statusChip = (status) => {
    if (status === "completed") return <span className="chip-completed"><Trophy size={12} /> Completed</span>
    if (status === "approved") return <span className="chip-approved"><CheckCircle2 size={12} /> Approved</span>
    return <span className="chip-pending"><Clock size={12} /> Pending</span>
  }

  return (
    <>
      <Navbar />
      <div className="mytournaments-page">
        <div className="mytournaments-inner">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1 className="page-title">My <span>Matches</span></h1>
            <div className="glow-line" />
          </motion.div>

          {loading ? (
            <LoadingScreen message="Loading your matches..." />
          ) : tournaments.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="empty-icon"><Target size={32} /></div>
              <p>You haven't joined any tournaments yet. Go find a battle!</p>
            </motion.div>
          ) : (
            <div className="mytournament-list">
              {tournaments.map((t, index) => (
                <motion.div
                  className="mytournament-card glass-card-static"
                  key={t.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -2 }}
                >
                  <div className="mt-card-top">
                    <h2>{t.name}</h2>
                    {statusChip(t.status)}
                  </div>

                  <div className="mt-meta">
                    <div className="mt-meta-item">
                      <Gamepad2 size={14} className="meta-icon" />
                      <div>
                        <span className="meta-label">Game</span>
                        <span className="meta-value">{t.game}</span>
                      </div>
                    </div>
                    <div className="mt-meta-item">
                      <IndianRupee size={14} className="meta-icon" />
                      <div>
                        <span className="meta-label">Entry Fee</span>
                        <span className="meta-value">₹{t.entry_fee}</span>
                      </div>
                    </div>
                    <div className="mt-meta-item">
                      <Trophy size={14} className="meta-icon gold" />
                      <div>
                        <span className="meta-label">Prize Pool</span>
                        <span className="meta-value gold">₹{t.prize_pool}</span>
                      </div>
                    </div>
                  </div>

                  {t.status === "completed" && (
                    <div className={`winner-banner${t.is_winner ? "" : " loser"}`}>
                      {t.is_winner ? (
                        <>
                          <div className="winner-icon"><Crown size={24} /></div>
                          <p>You won this tournament!</p>
                          <div className="winner-name">Congratulations, champion.</div>
                        </>
                      ) : (
                        <>
                          <div className="winner-icon loser-icon"><Heart size={24} /></div>
                          <p>Better luck next time</p>
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
                        style={t.status !== "approved" ? { opacity: 0.45, cursor: "not-allowed" } : {}}
                      >
                        {t.status === "approved" ? (
                          <><Rocket size={16} /> Open Room</>
                        ) : (
                          <><Clock size={16} /> Awaiting Approval</>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MyTournaments
