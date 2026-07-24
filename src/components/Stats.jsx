import { motion } from "framer-motion"
import { Users, Trophy, Gamepad2, Medal } from "lucide-react"
import "./Stats.css"

const stats = [
  { icon: Users, number: "500+", label: "Active Players", color: "purple" },
  { icon: Trophy, number: "₹50K+", label: "Prize Pool", color: "gold" },
  { icon: Gamepad2, number: "30+", label: "Tournaments", color: "cyan" },
  { icon: Medal, number: "95%", label: "Match Success", color: "green" },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

function Stats() {
  return (
    <section className="stats-section" id="stats">
      <motion.div
        className="stats-heading"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2>
          Trusted by <span className="stats-highlight">500+</span> College Players
        </h2>
        <p>Real tournaments. Real money. Real competition.</p>
      </motion.div>

      <motion.div
        className="stats-container"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {stats.map((s, index) => {
          const Icon = s.icon
          return (
            <motion.div className={`stat-card stat-${s.color}`} key={index} variants={item}>
              <div className="stat-icon">
                <Icon size={22} />
              </div>
              <h2>{s.number}</h2>
              <p>{s.label}</p>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}

export default Stats
