let audioCtx = null
let lastPlayTime = 0
const MIN_INTERVAL = 2000

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

export function playNotificationSound() {
  const now = Date.now()
  if (now - lastPlayTime < MIN_INTERVAL) return
  lastPlayTime = now

  try {
    const ctx = getAudioContext()

    if (ctx.state === "suspended") {
      ctx.resume()
    }

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = "sine"
    osc1.frequency.setValueAtTime(880, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08)

    osc2.type = "sine"
    osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
    osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.18)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02)
    gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.12)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.12)
    osc2.start(ctx.currentTime + 0.1)
    osc2.stop(ctx.currentTime + 0.3)
  } catch {
    // silent — audio not critical
  }
}
