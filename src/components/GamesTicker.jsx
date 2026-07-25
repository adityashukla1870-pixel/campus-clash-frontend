import "./GamesTicker.css"

const GAMES = [
  { emoji: "🔫", name: "BGMI" },
  { emoji: "🎯", name: "Valorant" },
  { emoji: "🔥", name: "Free Fire" },
  { emoji: "⚽", name: "FIFA / eFootball" },
  { emoji: "🏆", name: "Call of Duty Mobile" },
  { emoji: "🎮", name: "Clash Royale" },
  { emoji: "🕹️", name: "CS2" },
  { emoji: "🧨", name: "Fortnite" },
]

function GamesTicker() {
  const track = [...GAMES, ...GAMES]

  return (
    <section className="ticker-section" aria-label="Supported games">
      <div className="ticker-mask">
        <div className="ticker-track">
          {track.map((g, i) => (
            <div className="ticker-item" key={i}>
              <span className="ticker-emoji">{g.emoji}</span>
              <span>{g.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GamesTicker
