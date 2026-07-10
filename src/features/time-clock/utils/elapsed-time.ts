const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24

function getElapsedMilliseconds(startedAt: string, now: Date) {
  const startedAtTime = new Date(startedAt).getTime()

  if (!Number.isFinite(startedAtTime)) {
    return 0
  }

  return Math.max(0, now.getTime() - startedAtTime)
}

function formatElapsedTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / MILLISECONDS_PER_SECOND)
  const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const totalHours = Math.floor(totalMinutes / MINUTES_PER_HOUR)
  const days = Math.floor(totalHours / HOURS_PER_DAY)
  const hours = totalHours % HOURS_PER_DAY
  const minutes = totalMinutes % MINUTES_PER_HOUR
  const seconds = totalSeconds % SECONDS_PER_MINUTE

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }

  if (totalHours > 0) {
    return `${totalHours}:${padTime(minutes)}:${padTime(seconds)}`
  }

  return `${minutes}:${padTime(seconds)}`
}

function formatElapsedSummary(milliseconds: number) {
  const totalMinutes = Math.floor(
    milliseconds / (MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE),
  )
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR)
  const minutes = totalMinutes % MINUTES_PER_HOUR

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

function padTime(value: number) {
  return value.toString().padStart(2, "0")
}

export {
  formatElapsedSummary,
  formatElapsedTime,
  getElapsedMilliseconds,
}
