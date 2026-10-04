import type { RotaTimeFormat } from "@/features/rota/schemas/time-format-schema"
import { DEFAULT_ROTA_TIME_FORMAT } from "@/features/rota/constants/time-format"

function formatShiftTime(
  time: string,
  timeFormat: RotaTimeFormat = DEFAULT_ROTA_TIME_FORMAT
): string {
  if (timeFormat === "24h") return time

  const [hourText = "0", minute = "00"] = time.split(":")
  const hour = Number(hourText)
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`
}

export { formatShiftTime }
