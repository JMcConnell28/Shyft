import { addDays, differenceInMinutes, format, parseISO, startOfWeek } from "date-fns"

type TimesheetWeek = {
  days: TimesheetWeekDay[]
  weekEnd: string
  weekLabel: string
  weekStart: string
}

type TimesheetWeekDay = {
  date: string
  dateLabel: string
  dayLabel: string
}

function getTimesheetWeek(value?: string | null): TimesheetWeek {
  const baseDate = value ? parseISO(value) : new Date()
  const weekStartDate = startOfWeek(baseDate, { weekStartsOn: 1 })
  const weekStart = format(weekStartDate, "yyyy-MM-dd")
  const weekEndDate = addDays(weekStartDate, 6)
  const weekEnd = format(weekEndDate, "yyyy-MM-dd")
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStartDate, index)

    return {
      date: format(date, "yyyy-MM-dd"),
      dateLabel: format(date, "d MMM"),
      dayLabel: format(date, "EEE"),
    }
  })

  return {
    days,
    weekEnd,
    weekLabel: `${format(weekStartDate, "d MMM")} - ${format(
      weekEndDate,
      "d MMM yyyy",
    )}`,
    weekStart,
  }
}

function getDateKey(value: string | null | undefined) {
  if (!value) {
    return null
  }

  return format(new Date(value), "yyyy-MM-dd")
}

function getMinutesBetween(
  startValue: string | null | undefined,
  endValue: string | null | undefined,
  fallbackEnd: Date,
) {
  if (!startValue) {
    return 0
  }

  const start = new Date(startValue)
  const end = endValue ? new Date(endValue) : fallbackEnd
  const minutes = differenceInMinutes(end, start)

  return Number.isFinite(minutes) ? Math.max(0, minutes) : 0
}

function formatHours(minutes: number) {
  const hours = minutes / 60

  return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)}h`
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return "--:--"
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not set"
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value))
}

export {
  formatDateTime,
  formatHours,
  formatTime,
  getDateKey,
  getMinutesBetween,
  getTimesheetWeek,
}
export type { TimesheetWeek, TimesheetWeekDay }
