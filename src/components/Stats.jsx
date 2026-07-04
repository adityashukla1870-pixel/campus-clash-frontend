import { FaUsers, FaTrophy, FaGamepad, FaMedal } from "react-icons/fa"
import "./Stats.css"

function Stats() {
  const stats = [
    { icon: <FaUsers />, number: "500+", label: "Active Players" },
    { icon: <FaTrophy />, number: "₹50K+", label: "Prize Pool" },
    { icon: <FaGamepad />, number: "30+", label: "Tournaments" },
    { icon: <FaMedal />, number: "95%", label: "Match Success" },
  ]

  return (
    <section className="stats-section" id="stats">
      <div className="stats-heading">
        <h2>Trusted by <span style={{color:'var(--purple-light)'}}>500+</span> College Players</h2>
        <p>Real tournaments. Real money. Real competition.</p>
      </div>
      <div className="stats-container">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon">{item.icon}</div>
            <h2>{item.number}</h2>
            <p>{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Stats
