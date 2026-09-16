type ClockSettingOption = {
  label: string
  value: string
}

const GRACE_PERIOD_OPTIONS = createMinuteOptions([
  0, 5, 10, 15, 30, 45, 60, 90, 120,
])

const REVIEW_THRESHOLD_OPTIONS = createMinuteOptions([
  5, 10, 15, 30, 45, 60, 90, 120, 180, 240,
])

const MISSED_CLOCK_OUT_ALERT_OPTIONS = createMinuteOptions([
  15, 30, 60, 90, 120, 180, 240, 360, 480, 720, 1440,
])

const HARD_REVIEW_OPTIONS = createMinuteOptions([
  60, 120, 180, 240, 360, 480, 720, 960, 1440, 2160, 2880,
])

const CLOCK_TIMEZONE_OPTIONS: Array<ClockSettingOption> = [
  { label: "London", value: "Europe/London" },
  { label: "Dublin", value: "Europe/Dublin" },
  { label: "Lisbon", value: "Europe/Lisbon" },
  { label: "Paris", value: "Europe/Paris" },
  { label: "Amsterdam", value: "Europe/Amsterdam" },
  { label: "Berlin", value: "Europe/Berlin" },
]

function createMinuteOptions(minutes: Array<number>) {
  return minutes.map<ClockSettingOption>((value) => ({
    label: formatMinuteOption(value),
    value: value.toString(),
  }))
}

function formatMinuteOption(minutes: number) {
  if (minutes === 0) return "No grace period"
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`
  if (minutes % 60 === 0) {
    const hours = minutes / 60
    return `${hours} hour${hours === 1 ? "" : "s"}`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export {
  CLOCK_TIMEZONE_OPTIONS,
  GRACE_PERIOD_OPTIONS,
  HARD_REVIEW_OPTIONS,
  MISSED_CLOCK_OUT_ALERT_OPTIONS,
  REVIEW_THRESHOLD_OPTIONS,
  formatMinuteOption,
}
export type { ClockSettingOption }
