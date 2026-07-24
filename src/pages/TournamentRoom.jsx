import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Gamepad2, Hash, KeyRound, Clock, Radio, Copy, Check } from "lucide-react"
import Navbar from "../components/Navbar"
import LoadingScreen from "../components/LoadingScreen"
import API from "../api/axios"
import "./TournamentRoom.css"

function TournamentRoom() {
  const { id } = useParams()
  const [timeLeft, setTimeLeft] = useState("")
  const [room, setRoom] = useState(null)
  const [copiedField, setCopiedField] = useState("")

  useEffect(() => {
    API.get(`/tournament/room/${id}`)
      .then(res => setRoom(res.data))
      .catch(console.error)
  }, [id])

  useEffect(() => {
    if (!room || !room.room_id) return
    const interval = setInterval(() => {
      const diff = new Date(room.match_start_time).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft("Match Started"); clearInterval(interval); return }
      const minutes = Math.floor((diff / 60000) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      setTimeLeft(`${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [room])

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  if (!room) {
    return (
      <>
        <Navbar />
        <LoadingScreen message="Loading room details..." />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="room-page">
        <div className="room-bg-glow" />

        <motion.div
          className="room-card glass-card-static accent-top-purple"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="room-icon-wrap">
            <Gamepad2 size={32} />
          </div>
          <h1 className="room-title">Match Room</h1>
          <p className="room-subtitle">Get ready to compete</p>

          {!room?.room_id ? (
            <motion.div
              className="room-waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="waiting-icon">
                <Radio size={28} className="pulse-icon" />
              </div>
              <p className="waiting-title">Waiting for admin to release room</p>
              <p className="waiting-desc">Come back shortly — details will appear here.</p>
            </motion.div>
          ) : (
            <motion.div
              className="room-details"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="credentials-grid">
                <div className="credential-box">
                  <div className="cred-label">
                    <Hash size={12} /> Room ID
                  </div>
                  <div className="cred-value cyan">{room.room_id}</div>
                  <button className="cred-copy" onClick={() => copyText(room.room_id, "id")}>
                    {copiedField === "id" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="credential-box">
                  <div className="cred-label">
                    <KeyRound size={12} /> Password
                  </div>
                  <div className="cred-value purple">{room.room_password}</div>
                  <button className="cred-copy" onClick={() => copyText(room.room_password, "pass")}>
                    {copiedField === "pass" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="countdown-box">
                <div className="countdown-label">
                  <Clock size={14} /> Match Starts In
                </div>
                <motion.div
                  className="countdown-value"
                  key={timeLeft}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {timeLeft}
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default TournamentRoom
