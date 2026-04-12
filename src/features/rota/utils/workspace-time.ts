function getShiftDurationMinutes(startTime: string, endTime: string) {
  return Math.max(0, getMinutesFromTime(endTime) - getMinutesFromTime(startTime))
}

function getMinutesFromTime(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":")

  return Number(hours) * 60 + Number(minutes)
}

function formatMinutesAsHours(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

export { formatMinutesAsHours, getMinutesFromTime, getShiftDurationMinutes }
