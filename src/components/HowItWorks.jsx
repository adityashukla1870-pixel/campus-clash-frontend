import { FaUserPlus, FaTrophy, FaGamepad, FaMoneyBillWave } from "react-icons/fa"
import Reveal from "./Reveal"
import { handleTiltMove, handleTiltLeave } from "../utils/tilt"
import "./HowItWorks.css"

const STEPS = [
  { icon: <FaUserPlus />, step: "01", title: "Create Your Account", desc: "Sign up in seconds with your college email and gaming ID." },
  { icon: <FaTrophy />, step: "02", title: "Pick a Tournament", desc: "Browse live and upcoming brackets across your favourite games." },
  { icon: <FaGamepad />, step: "03", title: "Get Your Room ID", desc: "Receive match details straight to your dashboard before kickoff." },
  { icon: <FaMoneyBillWave />, step: "04", title: "Win & Get Paid", desc: "Top the leaderboard and cash out your prize money instantly." },
]

function HowItWorks() {
  return (
    <section className="section how-section" id="how-it-works">
      <Reveal className="section-heading">
        <div className="eyebrow">Get Started</div>
        <h2>From sign-up to victory in 4 steps</h2>
        <p>No complicated setup. Just register, play, and get rewarded.</p>
      </Reveal>

      <div className="how-track">
        {STEPS.map((s, i) => (
          <Reveal
            key={i}
            delay={i * 100}
            direction="up"
            className="how-step chamfer"
            onMouseMove={(e) => handleTiltMove(e, { maxTilt: 8, lift: -4 })}
            onMouseLeave={handleTiltLeave}
          >
            <div className="how-icon">{s.icon}</div>
            <span className="how-number">{s.step}</span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            {i < STEPS.length - 1 && <div className="how-connector" />}
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
