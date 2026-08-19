import { FaGamepad, FaLayerGroup, FaUsers, FaChartBar } from "react-icons/fa"
import { motion } from "framer-motion"
import Reveal from "./Reveal"
import { handleTiltMove, handleTiltLeave } from "../utils/tilt"
import "./Stats.css"

/**
 * Platform highlights — describes what Campus Clash actually offers.
 * No fabricated social-proof numbers (player counts, prize pools, win rates);
 * only real, verifiable platform capabilities.
 */
const HIGHLIGHTS = [
  {
    icon: <FaGamepad />,
    title: "8+ Games Supported",
    desc: "BGMI, Valorant, Free Fire, COD Mobile and more, all in one place.",
  },
  {
    icon: <FaLayerGroup />,
    title: "Multiple Formats",
    desc: "Single elimination, double elimination and round-robin brackets.",
  },
  {
    icon: <FaUsers />,
    title: "Solo, Duo & Squad",
    desc: "Register alone or bring your full team into the bracket.",
  },
  {
    icon: <FaChartBar />,
    title: "Live Bracket Tracking",
    desc: "Watch matches update in real time, right from your dashboard.",
  },
]

function HighlightCard({ item, delay }) {
  return (
    <Reveal
      delay={delay}
      direction="up"
      className="stat-card chamfer hover-lift"
      onMouseMove={(e) => handleTiltMove(e, { maxTilt: 10 })}
      onMouseLeave={handleTiltLeave}
    >
      <motion.div
        className="stat-icon"
        whileHover={{ rotate: -6, scale: 1.08 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {item.icon}
      </motion.div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
    </Reveal>
  )
}

function Stats() {
  return (
    <section className="stats-section" id="stats">
      <Reveal className="stats-heading">
        <h2>Built for <span style={{ color: "var(--purple-light)" }}>Serious</span> College Gamers</h2>
        <p>A complete esports tournament experience — from registration to prize payout.</p>
      </Reveal>
      <div className="stats-container">
        {HIGHLIGHTS.map((item, index) => (
          <HighlightCard item={item} delay={index * 90} key={index} />
        ))}
      </div>
    </section>
  )
}

export default Stats
