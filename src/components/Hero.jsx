import { motion } from "framer-motion"
import { Gamepad2, ArrowRight, Zap, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./Hero.css"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
}

function Hero() {
  const navigate = useNavigate()

  return (
    <section className="hero-section">
      <div className="hero-grid-bg" />
      <div className="hero-glow hero-glow-purple" />
      <div className="hero-glow hero-glow-cyan" />

      <motion.div className="hero-left" initial="hidden" animate="visible">
        <motion.div className="hero-badge" custom={0} variants={fadeUp}>
          <Zap size={14} />
          India's College Esports Platform
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp}>
          LEVEL UP YOUR
          <br />
          <span className="accent">CAMPUS ESPORTS</span>
          <br />
          JOURNEY
        </motion.h1>

        <motion.p className="hero-desc" custom={2} variants={fadeUp}>
          Battle against the best college players across India, compete in high-stakes
          tournaments, and win real prize money. Your championship starts here.
        </motion.p>

        <motion.div className="hero-buttons" custom={3} variants={fadeUp}>
          <button className="btn-primary" onClick={() => navigate("/register")}>
            <Gamepad2 size={18} />
            Join The Arena
          </button>
          <button className="btn-secondary" onClick={() => navigate("/login")}>
            Login
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-right"
        initial={{ opacity: 0, x: 40, rotateY: -8 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="preview-card glass-card-static accent-top-purple">
          <div className="live-row">
            <div className="live-tag">
              <span className="pulse-dot" />
              Live Now
            </div>
            <span className="badge badge-purple">BGMI</span>
          </div>

          <h3>BGMI Championship</h3>

          <div className="preview-info">
            <div className="info-block">
              <small>Prize Pool</small>
              <h2 className="gold">₹5,000</h2>
            </div>
            <div className="info-block">
              <small>Players</small>
              <h2>92 / 100</h2>
            </div>
          </div>

          <div className="countdown">
            <div className="countdown-label">Starts In</div>
            <h2>02 : 35 : 12</h2>
          </div>

          <div className="player-avatars">
            <div className="avatar-stack">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="avatar-dot" style={{ zIndex: 4 - i }}>
                  <Users size={12} />
                </div>
              ))}
            </div>
            <span className="player-count-text">+88 players joined</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
