import {
  addDays,
  addWeeks,
  endOfMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns"

import { getWeekRangeFromStart, normalizeWeekStart } from "@/lib/rota-schemas"

function buildRollingWeekStarts({
  selectedWeekStart,
  count = 10,
}: {
  selectedWeekStart: string
  count?: number
}) {
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const selectedDate = parseISO(selectedWeekStart)
  const selectedWeekDate = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const totalWeeks = Math.max(
    count,
    Math.round(
      (selectedWeekDate.getTime() - currentWeekStart.getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    ) + 4,
  )

  return Array.from({ length: totalWeeks }, (_, index) =>
    normalizeWeekStart(addWeeks(currentWeekStart, index)),
  )
}

function buildMonthWeekStarts(month: Date) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const firstWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const weekStarts: Array<string> = []

  for (let cursor = firstWeekStart; cursor <= monthEnd; cursor = addWeeks(cursor, 1)) {
    weekStarts.push(normalizeWeekStart(cursor))
  }

  return weekStarts
}

function formatWeekRangeLabel(weekStart: string) {
  return getWeekRangeFromStart(weekStart).summaryLabel
}

function formatWeekDaysLabel(weekStart: string) {
  const range = getWeekRangeFromStart(weekStart)
  return `${range.startLabel} - ${range.endLabel}`
}

function buildWeekDayNumbers(weekStart: string) {
  const start = parseISO(weekStart)

  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(start, index)

    return {
      key: normalizeWeekStart(day) + `-${index}`,
      shortLabel: day.toLocaleDateString("en-GB", { weekday: "short" }),
      dayOfMonth: day.toLocaleDateString("en-GB", { day: "numeric" }),
    }
  })
}

export {
  buildMonthWeekStarts,
  buildRollingWeekStarts,
  buildWeekDayNumbers,
  formatWeekDaysLabel,
  formatWeekRangeLabel,
}
