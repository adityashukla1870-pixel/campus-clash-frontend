import { FaShieldAlt, FaBolt, FaWallet, FaChartLine, FaUsers, FaHeadset } from "react-icons/fa"
import Reveal from "./Reveal"
import "./Features.css"

const FEATURES = [
  {
    icon: <FaShieldAlt />,
    title: "Verified & Fair",
    desc: "Every match is monitored with strict anti-cheat and dispute resolution so results are always fair.",
  },
  {
    icon: <FaWallet />,
    title: "Instant Payouts",
    desc: "Winnings are released straight to your account — no waiting weeks to see your prize money.",
  },
  {
    icon: <FaBolt />,
    title: "Lightning Fast Setup",
    desc: "Register, pick your slot, and get your room ID in minutes. Zero friction between you and the game.",
  },
  {
    icon: <FaChartLine />,
    title: "Climb the Rankings",
    desc: "Track your stats across tournaments and build a competitive profile college recruiters notice.",
  },
  {
    icon: <FaUsers />,
    title: "Real Campus Community",
    desc: "Squad up with players from your own college or rivals from across the country.",
  },
  {
    icon: <FaHeadset />,
    title: "24/7 Match Support",
    desc: "Our admins are on standby during every tournament to keep things running smoothly.",
  },
]

function Features() {
  return (
    <section className="section features-section" id="features">
      <Reveal className="section-heading">
        <div className="eyebrow">Why Campus Clash</div>
        <h2>Built for serious competitors</h2>
        <p>Everything you need to compete, get paid, and get noticed — all in one platform.</p>
      </Reveal>

      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <Reveal key={i} delay={i * 80} direction="up" className="feature-card glass-panel chamfer hover-lift">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default Features
