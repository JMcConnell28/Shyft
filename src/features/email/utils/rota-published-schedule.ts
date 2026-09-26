import { addDays, format, parseISO } from "date-fns"

import type { RotaPublishedShift } from "@/features/email/types/rota-published"

type RotaPublishedDay = {
  dayDate: string
  label: string
  shifts: Array<RotaPublishedShift>
}

function buildRotaPublishedDays(
  weekStart: string,
  shifts: Array<RotaPublishedShift>
): Array<RotaPublishedDay> {
  const startDate = parseISO(weekStart)

  return Array.from({ length: 7 }, (_, index) => {
    const dayDate = format(addDays(startDate, index), "yyyy-MM-dd")

    return {
      dayDate,
      label: format(parseISO(dayDate), "EEE d MMM"),
      shifts: shifts.filter((shift) => shift.dayDate === dayDate),
    }
  })
}

function formatRotaPublishedWeek(weekStart: string): string {
  const startDate = parseISO(weekStart)
  const endDate = addDays(startDate, 6)

  return `${format(startDate, "EEE d MMM")} – ${format(endDate, "EEE d MMM yyyy")}`
}

function formatRotaPublishedHours(minutes: number): string {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(minutes / 60)
}

export {
  buildRotaPublishedDays,
  formatRotaPublishedHours,
  formatRotaPublishedWeek,
}
