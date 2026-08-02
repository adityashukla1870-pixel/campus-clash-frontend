import "./SpotlightGlow.css"

/**
 * Reusable "spotlight" backdrop — a soft radial glow plus floating
 * particles, sitting behind content to draw focus to it (same effect as
 * the logo on the Login page / the Hero section background).
 *
 * Two modes:
 *
 * 1. Circle mode (default) — a glow sized to sit behind ONE element
 *    (a logo, an avatar, an icon). Drop it as the first child inside a
 *    `position: relative` wrapper, give your real content `position:
 *    relative; z-index: 1`.
 *
 *      <div style={{ position: 'relative' }}>
 *        <SpotlightGlow />
 *        <div style={{ position: 'relative', zIndex: 1 }}>...</div>
 *      </div>
 *
 * 2. Fullpage mode (`fullpage`) — a strong, fixed-to-viewport ambient
 *    glow that covers the whole screen and stays put while you scroll
 *    (this is what Hero.jsx does on the landing page). Drop it as the
 *    first child inside your page's outer wrapper.
 *
 *      <div className="my-page" style={{ position: 'relative' }}>
 *        <SpotlightGlow fullpage />
 *        <div style={{ position: 'relative', zIndex: 1 }}>...page content...</div>
 *      </div>
 *
 * Props:
 *   size      - circle-mode diameter in px (default 320, ignored in fullpage mode)
 *   color     - "purple" | "cyan" | "gold" — dominant particle/glow tone
 *   pulse     - whether the glow breathes in/out (default true)
 *   fullpage  - viewport-anchored ambient mode instead of a small circle
 *   particles - override the default particle field
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

const FULLPAGE_PARTICLES = [
  { top: '10%', left: '8%',  size: 7, delay: '0s',   dur: '8s',   tone: 'primary' },
  { top: '22%', left: '90%', size: 6, delay: '1.2s', dur: '9s',   tone: 'secondary' },
  { top: '65%', left: '5%',  size: 7, delay: '2.4s', dur: '7.5s', tone: 'secondary' },
  { top: '78%', left: '92%', size: 5, delay: '3.6s', dur: '10s',  tone: 'primary' },
  { top: '8%',  left: '55%', size: 6, delay: '0.7s', dur: '8.5s', tone: 'primary' },
  { top: '40%', left: '85%', size: 8, delay: '3.5s', dur: '9.5s', tone: 'secondary' },
  { top: '92%', left: '40%', size: 5, delay: '2s',   dur: '7.5s', tone: 'primary' },
  { top: '48%', left: '15%', size: 6, delay: '1.6s', dur: '8.8s', tone: 'secondary' },
  { top: '30%', left: '35%', size: 5, delay: '4.4s', dur: '9.2s', tone: 'primary' },
  { top: '58%', left: '60%', size: 7, delay: '2.9s', dur: '7.8s', tone: 'secondary' },
  { top: '85%', left: '68%', size: 5, delay: '0.4s', dur: '8.3s', tone: 'primary' },
]

function SpotlightGlow({ particles, size = 320, color = "purple", pulse = true, fullpage = false }) {
  const activeParticles = particles || (fullpage ? FULLPAGE_PARTICLES : DEFAULT_PARTICLES)

  const glowVar = color === "cyan" ? "var(--cyan-glow)" : color === "gold" ? "rgba(245,158,11,0.28)" : "var(--purple-glow)"
  const primaryDot = color === "cyan" ? "var(--cyan-light)" : color === "gold" ? "var(--gold)" : "var(--purple-light)"
  const secondaryDot = color === "cyan" ? "var(--purple-light)" : color === "gold" ? "var(--purple-light)" : "var(--cyan-light)"
  const secondaryGlow = color === "purple" ? "var(--cyan-glow)" : glowVar

  const wrapClass = fullpage ? "spotlight-glow spotlight-fullpage" : "spotlight-glow"
  const style = fullpage ? {} : { '--spotlight-size': `${size}px` }

  return (
    <div className={wrapClass} aria-hidden="true" style={style}>
      {fullpage ? (
        <>
          <div
            className="spotlight-radial spotlight-radial-ambient"
            style={{ background: `radial-gradient(circle, ${glowVar} 0%, transparent 75%)` }}
          />
          <div
            className={`spotlight-radial spotlight-radial-a${pulse ? ' spotlight-pulse' : ''}`}
            style={{ background: `radial-gradient(circle, ${glowVar} 0%, transparent 65%)` }}
          />
          <div
            className={`spotlight-radial spotlight-radial-b${pulse ? ' spotlight-pulse-delayed' : ''}`}
            style={{ background: `radial-gradient(circle, ${secondaryGlow} 0%, transparent 65%)` }}
          />
        </>
      ) : (
        <div
          className={`spotlight-radial${pulse ? ' spotlight-pulse' : ''}`}
          style={{ background: `radial-gradient(circle, ${glowVar} 0%, transparent 70%)` }}
        />
      )}
      <div className="spotlight-particles">
        {activeParticles.map((p, i) => {
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
                boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${glow}`,
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
