import { FaGamepad, FaArrowRight, FaBolt } from "react-icons/fa"
import { FiMonitor, FiAward, FiCrosshair, FiZap } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { handleTiltMove, handleTiltLeave } from "../utils/tilt"
import "./Hero.css"

const HERO_PARTICLES = [
  { top: '15%', left: '8%',  size: 9, color: 'var(--purple-light)', glow: 'var(--purple-glow)', delay: '0s',   dur: '8s' },
  { top: '28%', left: '92%', size: 6, color: 'var(--cyan-light)',   glow: 'var(--cyan-glow)',   delay: '1.4s', dur: '9s' },
  { top: '68%', left: '4%',  size: 7, color: 'var(--cyan-light)',   glow: 'var(--cyan-glow)',   delay: '2.8s', dur: '7s' },
  { top: '80%', left: '38%', size: 5, color: 'var(--purple-light)', glow: 'var(--purple-glow)', delay: '4.2s', dur: '10s' },
  { top: '10%', left: '55%', size: 6, color: 'var(--purple-light)', glow: 'var(--purple-glow)', delay: '0.7s', dur: '8.5s' },
  { top: '45%', left: '88%', size: 8, color: 'var(--cyan-light)',   glow: 'var(--cyan-glow)',   delay: '3.5s', dur: '9.5s' },
  { top: '90%', left: '80%', size: 5, color: 'var(--purple-light)', glow: 'var(--purple-glow)', delay: '2s',   dur: '7.5s' },
]

function Hero() {
  const navigate = useNavigate()

  return (
    <section className="hero-section">
      <div className="hero-scanline" aria-hidden="true"></div>
      <div className="hero-particles" aria-hidden="true">
        {HERO_PARTICLES.map((p, i) => (
          <span
            key={i}
            className="hero-particle"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2.4}px ${p.size / 1.6}px ${p.glow}`,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>

      <div className="hero-left animate-in">
        <div className="hero-badge">
          <FaBolt />
          India's College Esports Platform
        </div>

        <h1>
          LEVEL UP YOUR<br />
          <span className="accent text-gradient-animated">CAMPUS ESPORTS</span><br />
          JOURNEY
        </h1>

        <p className="hero-desc">
          Battle against the best college players across India, compete in high-stakes
          tournaments, and win real prize money. Your championship starts here.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => navigate("/register")}>
            <FaGamepad /> Join The Arena
          </button>
          <button className="btn-secondary" onClick={() => navigate("/login")}>
            Login <FaArrowRight />
          </button>
        </div>
      </div>

      <div className="hero-right animate-in" style={{ animationDelay: "0.15s" }}>
        <div
          className="preview-card chamfer"
          onMouseMove={(e) => handleTiltMove(e, { maxTilt: 6, lift: -6, pauseAnimation: true })}
          onMouseLeave={(e) => handleTiltLeave(e, { pauseAnimation: true })}
        >
          <div className="live-row">
            <div className="live-tag">
              <span className="pulse-dot"></span>
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
            <div className="avatar-pill">
              {[FiMonitor, FiAward, FiCrosshair, FiZap].map((Icon, i) => (
                <div key={i} className="avatar-dot" style={{background: ['#d4af37','#f9a825','#f59e0b','#22c55e'][i]+'33'}}><Icon /></div>
              ))}
            </div>
            <span className="player-count-text">+88 players joined</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
