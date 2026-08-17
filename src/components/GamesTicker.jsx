import { FiTarget, FiZap, FiCircle, FiAward, FiMonitor, FiCrosshair } from "react-icons/fi"
import "./GamesTicker.css"

const GAMES = [
  { Icon: FiCrosshair, name: "BGMI" },
  { Icon: FiTarget, name: "Valorant" },
  { Icon: FiZap, name: "Free Fire" },
  { Icon: FiCircle, name: "FIFA / eFootball" },
  { Icon: FiAward, name: "Call of Duty Mobile" },
  { Icon: FiMonitor, name: "Clash Royale" },
  { Icon: FiMonitor, name: "CS2" },
  { Icon: FiZap, name: "Fortnite" },
]

function GamesTicker() {
  const track = [...GAMES, ...GAMES]

  return (
    <section className="ticker-section" aria-label="Supported games">
      <div className="ticker-mask">
        <div className="ticker-track">
          {track.map((g, i) => (
            <div className="ticker-item" key={i}>
              <span className="ticker-emoji"><g.Icon /></span>
              <span>{g.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GamesTicker
