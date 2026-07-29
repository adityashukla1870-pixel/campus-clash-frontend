import { useEffect, useRef, useState } from "react"
import { FaUsers, FaTrophy, FaGamepad, FaMedal } from "react-icons/fa"
import Reveal from "./Reveal"
import "./Stats.css"

const STATS = [
  { icon: <FaUsers />, prefix: "", value: 500, suffix: "+", label: "Active Players" },
  { icon: <FaTrophy />, prefix: "₹", value: 50, suffix: "K+", label: "Prize Pool" },
  { icon: <FaGamepad />, prefix: "", value: 30, suffix: "+", label: "Tournaments" },
  { icon: <FaMedal />, prefix: "", value: 95, suffix: "%", label: "Match Success" },
]

/** Counts a number up from 0 to `value` once it becomes visible. Presentation only. */
function useCountUp(value, active, duration = 1400) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!active || started.current) return
    started.current = true

    let startTime = null
    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, value, duration])

  return display
}

function StatCard({ stat, active, delay }) {
  const count = useCountUp(stat.value, active)
  return (
    <Reveal delay={delay} direction="up" className="stat-card chamfer hover-lift">
      <div className="stat-icon">{stat.icon}</div>
      <h2>{stat.prefix}{count}{stat.suffix}</h2>
      <p>{stat.label}</p>
    </Reveal>
  )
}

function Stats() {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="stats-section" id="stats" ref={sectionRef}>
      <Reveal className="stats-heading">
        <h2>Trusted by <span style={{color:'var(--purple-light)'}}>500+</span> College Players</h2>
        <p>Real tournaments. Real money. Real competition.</p>
      </Reveal>
      <div className="stats-container">
        {STATS.map((item, index) => (
          <StatCard stat={item} active={active} delay={index * 90} key={index} />
        ))}
      </div>
    </section>
  )
}

export default Stats
