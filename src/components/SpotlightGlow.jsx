import "./SpotlightGlow.css"

/**
 * Reusable "spotlight" backdrop — a soft radial glow plus a few floating
 * gold particles, sitting behind a piece of content to draw focus to it
 * (same effect as the logo on the Login page).
 *
 * Usage: drop it as the FIRST child inside a `position: relative` wrapper,
 * then give your actual content `position: relative; z-index: 1` so it
 * renders above the glow.
 *
 *   <div style={{ position: 'relative' }}>
 *     <SpotlightGlow />
 *     <div style={{ position: 'relative', zIndex: 1 }}>...your content...</div>
 *   </div>
 *
 * Reserve this for ONE key/hero moment per page (a logo, an avatar, a
 * winner card, a page header icon) — not every element, or the effect
 * loses its "draws your eye here" purpose.
 *
 * Props:
 *   size     - diameter in px (default 320)
 *   color    - "purple" | "cyan" | "gold" — sets the dominant particle/glow tone
 *   pulse    - whether the glow breathes in/out (default true)
 *   particles - override the default 9-dot two-tone field
 */

const DEFAULT_PARTICLES = [
  { top: '15%', left: '12%', size: 5, delay: '0s',   dur: '7s',   tone: 'primary' },
  { top: '70%', left: '85%', size: 4, delay: '1.4s', dur: '8s',   tone: 'secondary' },
  { top: '80%', left: '20%', size: 5, delay: '2.8s', dur: '6.5s', tone: 'secondary' },
  { top: '20%', left: '80%', size: 4, delay: '0.7s', dur: '7.5s', tone: 'primary' },
  { top: '45%', left: '50%', size: 6, delay: '2s',   dur: '9s',   tone: 'primary' },
  { top: '10%', left: '55%', size: 4, delay: '3.4s', dur: '8.2s', tone: 'secondary' },
  { top: '88%', left: '55%', size: 5, delay: '1s',   dur: '7.2s', tone: 'primary' },
  { top: '55%', left: '10%', size: 4, delay: '4s',   dur: '9.5s', tone: 'secondary' },
  { top: '35%', left: '92%', size: 5, delay: '2.4s', dur: '6.8s', tone: 'primary' },
]

function SpotlightGlow({ particles = DEFAULT_PARTICLES, size = 320, color = "purple", pulse = true }) {
  const glowVar = color === "cyan" ? "var(--cyan-glow)" : color === "gold" ? "rgba(245,158,11,0.16)" : "var(--purple-glow)"
  const primaryDot = color === "cyan" ? "var(--cyan-light)" : color === "gold" ? "var(--gold)" : "var(--purple-light)"
  const secondaryDot = color === "cyan" ? "var(--purple-light)" : color === "gold" ? "var(--purple-light)" : "var(--cyan-light)"
  const secondaryGlow = color === "purple" ? "var(--cyan-glow)" : glowVar

  return (
    <div className="spotlight-glow" aria-hidden="true" style={{ '--spotlight-size': `${size}px` }}>
      <div
        className={`spotlight-radial${pulse ? ' spotlight-pulse' : ''}`}
        style={{ background: `radial-gradient(circle, ${glowVar} 0%, transparent 70%)` }}
      />
      <div className="spotlight-particles">
        {particles.map((p, i) => {
          const dot = p.tone === "secondary" ? secondaryDot : primaryDot
          const glow = p.tone === "secondary" ? secondaryGlow : glowVar
          return (
            <span
              key={i}
              className="spotlight-particle"
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                background: dot,
                boxShadow: `0 0 ${p.size * 2.5}px ${p.size / 1.5}px ${glow}`,
                animationDelay: p.delay,
                animationDuration: p.dur,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default SpotlightGlow
