function getManualClockTime(occurredAt?: string, now = new Date()): Date {
  const time = occurredAt ? new Date(occurredAt) : now
  if (!Number.isFinite(time.getTime())) {
    throw new Error("Choose a valid date and time.")
  }
  if (time > now) throw new Error("Clock times cannot be in the future.")
  return time
}

function toLocalClockInput(time = new Date()): string {
  const local = new Date(time.getTime() - time.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export { getManualClockTime, toLocalClockInput }
