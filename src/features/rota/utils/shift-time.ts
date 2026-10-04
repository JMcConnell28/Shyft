import type { RotaTimeFormat } from "@/features/rota/schemas/time-format-schema"
import type { ShiftTimeParts } from "@/features/rota/types/shift-time"
import { DEFAULT_ROTA_TIME_FORMAT } from "@/features/rota/constants/time-format"

const shiftTimePattern = /^([01]\d|2[0-3]):(00|15|30|45)$/

const shiftTimeHourOptions = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 1

  return {
    label: String(hour),
    value: String(hour).padStart(2, "0"),
  }
})

const shiftTime24HourOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = String(hour).padStart(2, "0")
  return { label: value, value }
})

const shiftTimeMinuteOptions = ["00", "15", "30", "45"].map((value) => ({
  label: value,
  value,
}))

const shiftTimePeriodOptions = [
  { label: "AM", value: "AM" },
  { label: "PM", value: "PM" },
] as const

function parseShiftTimeParts(
  time: string,
  timeFormat: RotaTimeFormat = DEFAULT_ROTA_TIME_FORMAT
): ShiftTimeParts {
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
    hour: String(timeFormat === "24h" ? hour24 : hour24 % 12 || 12).padStart(
      2,
      "0"
    ),
    minute: shiftTimeMinuteOptions.some((option) => option.value === minuteText)
      ? minuteText
      : "00",
    period: hour24 >= 12 ? "PM" : "AM",
  }
}

function buildShiftTimeValue(
  parts: ShiftTimeParts,
  timeFormat: RotaTimeFormat = DEFAULT_ROTA_TIME_FORMAT
): string {
  const hour = Number(parts.hour) % 12
  const hour24 =
    timeFormat === "24h"
      ? Number(parts.hour)
      : parts.period === "PM"
        ? hour + 12
        : hour

  return `${String(hour24).padStart(2, "0")}:${parts.minute}`
}

export {
  buildShiftTimeValue,
  parseShiftTimeParts,
  shiftTime24HourOptions,
  shiftTimeHourOptions,
  shiftTimeMinuteOptions,
  shiftTimePattern,
  shiftTimePeriodOptions,
}
