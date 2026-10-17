import { addDays, format, parseISO, startOfWeek } from "date-fns"
import {
  combineDateAndTimeInTimeZone,
  getDateKeyInTimeZone,
} from "@/lib/time-zone"

function moveDashboardDate(date: string, days: number): string {
  return format(addDays(parseISO(date), days), "yyyy-MM-dd")
}
function getDashboardDayWindow(
  date: string,
  timeZone: string
): { start: string; end: string } {
  return {
    start: combineDateAndTimeInTimeZone(date, "00:00", timeZone).toISOString(),
    end: combineDateAndTimeInTimeZone(
      moveDashboardDate(date, 1),
      "00:00",
      timeZone
    ).toISOString(),
  }
}
function getDashboardWeekStart(date: string): string {
  return format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), "yyyy-MM-dd")
}
function formatDashboardTime(
  value: string,
  timeZone: string,
  timeFormat: "12h" | "24h" = "12h"
): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: timeFormat === "12h",
  }).format(new Date(value))
}
function formatAttentionDate(
  value: string,
  timeZone: string,
  now: Date
): string {
  const date = getDateKeyInTimeZone(value, timeZone)
  const today = getDateKeyInTimeZone(now, timeZone)
  const label =
    date === today
      ? "Today"
      : date === moveDashboardDate(today, -1)
        ? "Yesterday"
        : format(parseISO(date), "d MMM yyyy")
  return `${label} · ${formatDashboardTime(value, timeZone)}`
}
export {
  moveDashboardDate,
  getDashboardDayWindow,
  getDashboardWeekStart,
  formatDashboardTime,
  formatAttentionDate,
}
