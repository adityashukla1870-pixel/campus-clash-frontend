import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { jwtDecode } from "jwt-decode"
import { Trophy, Gamepad2, Users, IndianRupee, CheckCircle2, Lock, Target } from "lucide-react"
import Navbar from "../components/Navbar"
import LoadingScreen from "../components/LoadingScreen"
import API from "../api/axios"
import "./Tournament.css"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
}

function Tournament() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/"); return }
    try {
      const decoded = jwtDecode(token)
      setUserId(decoded.sub)
    } catch {
      navigate("/"); return
    }
    API.get("/tournament/all", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const data = res.data
        setTournaments(Array.isArray(data) ? data : [])
      })
      .finally(() => setLoading(false))
  }, [location.pathname, navigate])

  return (
    <>
      <Navbar />
      <div className="tournaments-page">
        <motion.div
          className="tournaments-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="tournaments-header-left">
            <div className="header-icon-wrap">
              <Trophy size={24} />
            </div>
            <div>
              <h1>Tournaments</h1>
              <p>Find your next battle — join, compete, win.</p>
            </div>
          </div>
          <span className="badge badge-purple">
            {tournaments.length} Active
          </span>
        </motion.div>

        {loading ? (
          <LoadingScreen message="Loading tournaments..." />
        ) : tournaments.length === 0 ? (
          <motion.div
            className="tournaments-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="empty-icon">
              <Target size={32} />
            </div>
            <p>No tournaments available right now. Check back soon!</p>
          </motion.div>
        ) : (
          <div className="tournament-list">
            {tournaments.map((t, index) => {
              const alreadyJoined = t.players?.includes(userId)
              const isFull = t.players.length >= t.max_players
              const fillPct = Math.round((t.players.length / t.max_players) * 100)

              return (
                <motion.div
                  className="tournament-card glass-card-static accent-top-purple"
                  key={t.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="card-header">
                    <span className="card-game-badge">
                      <Gamepad2 size={12} />
                      {t.game}
                    </span>
                    {alreadyJoined && (
                      <span className="badge badge-cyan">
                        <CheckCircle2 size={11} />
                        Joined
                      </span>
                    )}
                    {isFull && !alreadyJoined && (
                      <span className="card-full-badge">
                        <Lock size={11} />
                        Full
                      </span>
                    )}
                  </div>

                  <div className="card-title">{t.name}</div>

                  <div className="card-stats">
                    <div className="card-stat">
                      <IndianRupee size={14} className="stat-icon-sm gold" />
                      <div>
                        <div className="stat-label">Prize Pool</div>
                        <div className="stat-value prize">₹{t.prize_pool}</div>
                      </div>
                    </div>
                    <div className="card-stat">
                      <IndianRupee size={14} className="stat-icon-sm" />
                      <div>
                        <div className="stat-label">Entry Fee</div>
                        <div className="stat-value">₹{t.entry_fee}</div>
                      </div>
                    </div>
                  </div>

                  <div className="player-bar">
                    <div className="player-bar-top">
                      <span><Users size={13} /> Players</span>
                      <span>{t.players.length} / {t.max_players}</span>
                    </div>
                    <div className="bar-track">
                      <motion.div
                        className={`bar-fill${isFull ? " full" : ""}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${fillPct}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className={alreadyJoined ? "btn-joined" : isFull ? "btn-full" : "btn-join"}
                      onClick={() => !alreadyJoined && !isFull && navigate(`/tournament/${t.id}`)}
                      disabled={alreadyJoined || isFull}
                    >
                      {alreadyJoined ? (
                        <><CheckCircle2 size={16} /> Registered</>
                      ) : isFull ? (
                        <><Lock size={16} /> Full</>
                      ) : (
                        <>Join Now</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default Tournament
