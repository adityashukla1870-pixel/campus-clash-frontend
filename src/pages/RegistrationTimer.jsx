import { useEffect, useState } from "react"

function msLeftOf(deadline) {
  if (!deadline) return null
  return new Date(deadline).getTime() - Date.now()
}

function formatDuration(ms) {
  if (ms <= 0) return "Closed"
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

/**
 * Live countdown to a tournament's registration_deadline.
 * - Ticks every second.
 * - Calls onExpire() exactly once, right when the deadline passes.
 * - Renders nothing if no deadline is set (open-ended registration).
 */
function RegistrationTimer({ deadline, onExpire, style = {}, closedText = "🔒 Registration Closed" }) {
  const [msLeft, setMsLeft] = useState(() => msLeftOf(deadline))
  const [firedExpire, setFiredExpire] = useState(false)

  useEffect(() => {
    setMsLeft(msLeftOf(deadline))
    setFiredExpire(false)
  }, [deadline])

  useEffect(() => {
    if (!deadline) return undefined

    const tick = () => {
      const left = msLeftOf(deadline)
      setMsLeft(left)
      if (left <= 0 && !firedExpire) {
        setFiredExpire(true)
        if (onExpire) onExpire()
      }
    }

    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [deadline, firedExpire, onExpire])

  if (!deadline) return null

  const closed = msLeft <= 0

  return (
    <div className={`reg-timer${closed ? " reg-timer-closed" : ""}`} style={style}>
      {closed ? closedText : `⏳ Closes in ${formatDuration(msLeft)}`}
    </div>
  )
}

export default RegistrationTimer
