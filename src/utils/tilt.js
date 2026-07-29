/**
 * Mouse-follow 3D tilt — mirrors the interaction from the Stitch export's
 * `.tilt-card` mousemove script, reimplemented as lightweight vanilla DOM
 * handlers (no extra deps, no React state/re-renders on every mousemove).
 *
 * Usage: <div onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave}>
 * Pass { maxTilt, lift, pauseAnimation } as a second arg via a bound function
 * if you need to override defaults, e.g.:
 *   onMouseMove={(e) => handleTiltMove(e, { pauseAnimation: true })}
 */

export function handleTiltMove(e, { maxTilt = 8, lift = -4, pauseAnimation = false } = {}) {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * maxTilt
  const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * maxTilt

  if (pauseAnimation) card.style.animationPlayState = "paused"
  card.style.transition = "transform 0.1s ease-out"
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${lift}px)`
}

export function handleTiltLeave(e, { pauseAnimation = false } = {}) {
  const card = e.currentTarget
  card.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
  card.style.transform = ""
  if (pauseAnimation) card.style.animationPlayState = "running"
}
