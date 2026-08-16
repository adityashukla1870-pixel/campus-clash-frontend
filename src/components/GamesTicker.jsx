import { motion } from "framer-motion"
import {
  GiAk47,
  GiCrosshair,
  GiFlame,
  GiSoccerBall,
  GiMachineGun,
  GiCastle,
  GiTargetShot,
  GiIsland,
} from "react-icons/gi"
import "./GamesTicker.css"

const GAMES = [
  { icon: <GiAk47 />, name: "BGMI" },
  { icon: <GiCrosshair />, name: "Valorant" },
  { icon: <GiFlame />, name: "Free Fire" },
  { icon: <GiSoccerBall />, name: "FIFA / eFootball" },
  { icon: <GiMachineGun />, name: "Call of Duty Mobile" },
  { icon: <GiCastle />, name: "Clash Royale" },
  { icon: <GiTargetShot />, name: "CS2" },
  { icon: <GiIsland />, name: "Fortnite" },
]

function GamesTicker() {
  const track = [...GAMES, ...GAMES]

  return (
    <section className="ticker-section" aria-label="Supported games">
      <div className="ticker-mask">
        <div className="ticker-track">
          {track.map((g, i) => (
            <motion.div
              className="ticker-item"
              key={i}
              whileHover={{ scale: 1.08, y: -2 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <span className="ticker-icon">{g.icon}</span>
              <span>{g.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GamesTicker
