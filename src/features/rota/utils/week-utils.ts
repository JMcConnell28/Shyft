import {
  addDays,
  addWeeks,
  format,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns"

import type { RotaListSearch } from "@/features/rota/schemas/rota-schemas"
import { getWeekRangeFromStart, toIsoDate } from "@/lib/rota-schemas"

function formatUpdatedAt(value: string | Date) {
  return format(new Date(value), "d MMM yyyy, HH:mm")
}

function coerceNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const nextValue = Number.parseFloat(value)
    return Number.isFinite(nextValue) ? nextValue : 0
  }

  return 0
}

function buildRangeBounds(search: RotaListSearch) {
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  switch (search.range) {
    case "this-week":
      return {
        from: toIsoDate(currentWeekStart),
        to: toIsoDate(addDays(currentWeekStart, 6)),
      }

    case "next-4-weeks":
      return {
        from: toIsoDate(currentWeekStart),
        to: toIsoDate(addDays(addWeeks(currentWeekStart, 4), -1)),
      }

    case "past-4-weeks":
      return {
        from: toIsoDate(subWeeks(currentWeekStart, 4)),
        to: toIsoDate(subDays(currentWeekStart, 1)),
      }

    case "custom":
      if (search.from && search.to && search.from > search.to) {
        return {
          from: search.to,
          to: search.from,
        }
      }

      return {
        from: search.from,
        to: search.to,
      }

    default:
      return {
        from: undefined,
        to: undefined,
      }
  }
}

function buildWeekLabel(weekStart: string) {
  const range = getWeekRangeFromStart(weekStart)
  return `${range.startLabel} - ${range.endLabel}`
}

function getCurrentWeekStart() {
  return toIsoDate(startOfWeek(new Date(), { weekStartsOn: 1 }))
}

function isRotaWeekBeforeCurrentWeek(weekStart: string) {
  return weekStart < getCurrentWeekStart()
}

function canExportSageTimesheetForRota({
  publishedSnapshotAvailable,
  status,
  weekStart,
}: {
  publishedSnapshotAvailable: boolean
  status: "draft" | "published" | string
  weekStart: string
}) {
  return (
    status === "published" &&
    publishedSnapshotAvailable &&
    isRotaWeekBeforeCurrentWeek(weekStart)
  )
}

export {
  buildRangeBounds,
  buildWeekLabel,
  canExportSageTimesheetForRota,
  coerceNumber,
  formatUpdatedAt,
  getCurrentWeekStart,
  isRotaWeekBeforeCurrentWeek,
}
