const shiftTimePattern = /^([01]\d|2[0-3]):(00|15|30|45)$/

const shiftTimeHourOptions = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 1

  return {
    label: String(hour),
    value: String(hour).padStart(2, "0"),
  }
})

const shiftTimeMinuteOptions = ["00", "15", "30", "45"].map((value) => ({
  label: value,
  value,
}))

const shiftTimePeriodOptions = [
  { label: "AM", value: "AM" },
  { label: "PM", value: "PM" },
] as const

type ShiftTimePeriod = (typeof shiftTimePeriodOptions)[number]["value"]

type ShiftTimeParts = {
  hour: string
  minute: string
  period: ShiftTimePeriod
}

function parseShiftTimeParts(time: string): ShiftTimeParts {
  const [hourText = "09", minuteText = "00"] = time.split(":")
  const hour24 = Number(hourText)

  if (!Number.isInteger(hour24) || hour24 < 0 || hour24 > 23) {
    return {
      hour: "09",
      minute: "00",
      period: "AM",
    }
  }

  return {
    hour: String(hour24 % 12 || 12).padStart(2, "0"),
    minute: shiftTimeMinuteOptions.some((option) => option.value === minuteText)
      ? minuteText
      : "00",
    period: hour24 >= 12 ? "PM" : "AM",
  }
}

function buildShiftTimeValue(parts: ShiftTimeParts) {
  const hour = Number(parts.hour) % 12
  const hour24 = parts.period === "PM" ? hour + 12 : hour

  return `${String(hour24).padStart(2, "0")}:${parts.minute}`
}

export {
  buildShiftTimeValue,
  parseShiftTimeParts,
  shiftTimeHourOptions,
  shiftTimeMinuteOptions,
  shiftTimePattern,
  shiftTimePeriodOptions,
}
export type { ShiftTimeParts, ShiftTimePeriod }
