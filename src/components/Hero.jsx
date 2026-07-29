import { FaGamepad, FaArrowRight, FaBolt } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { handleTiltMove, handleTiltLeave } from "../utils/tilt"
import "./Hero.css"

function Hero() {
  const navigate = useNavigate()

  return (
    <section className="hero-section">
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
              {['🎮','🏆','⚔️','🔥'].map((e, i) => (
                <div key={i} className="avatar-dot" style={{background: ['#d4af37','#f9a825','#f59e0b','#22c55e'][i]+'33'}}>{e}</div>
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
