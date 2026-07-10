import { addDays, format, getISODay, parseISO } from "date-fns"

import type {
  CreateWorkspaceShiftInput,
  WorkspaceDay,
  WorkspaceLocation,
  WorkspaceShift,
} from "@/features/rota/types/workspace"

type ShiftRowShape = {
  day_date: string | Date
  end_kind: string | null
  end_time: string | null
  id: string
  shift_type: string
  split_second_end_time: string | null
  split_second_start_time: string | null
  start_time: string
  zone_id: string | null
  zone_name_snapshot: string
}

const LOCATION_CLOSE_DB_VALUE = "location_close"
const LOCATION_CLOSE_APP_VALUE = "locationClose"

type OperatingHoursRowShape = {
  close_time: string
  close_time_next_day: boolean
  weekday: number
}

function buildWorkspaceDays(weekStart: string | Date) {
  const weekStartDate = normalizeDateValue(weekStart)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStartDate, index)

    return {
      id: `day-${format(date, "yyyy-MM-dd")}`,
      isoDate: format(date, "yyyy-MM-dd"),
      shortLabel: format(date, "EEE"),
      dayNumber: format(date, "d"),
      monthLabel: format(date, "MMM"),
    } satisfies WorkspaceDay
  })
}

function buildLocationCloseTimesByDayId(
  days: WorkspaceDay[],
  operatingHours: OperatingHoursRowShape[]
) {
  const closeTimeByWeekday = operatingHours.reduce<Record<number, string>>(
    (map, row) => {
      map[row.weekday] = formatDbTime(row.close_time)
      return map
    },
    {}
  )

  return days.reduce<Record<string, string>>((map, day, index) => {
    const closeTime = closeTimeByWeekday[index + 1]

    if (closeTime) {
      map[day.id] = closeTime
    }

    return map
  }, {})
}

function buildLocationCloseTimeNextDayByDayId(
  days: WorkspaceDay[],
  operatingHours: OperatingHoursRowShape[]
) {
  const nextDayByWeekday = operatingHours.reduce<Record<number, boolean>>(
    (map, row) => {
      map[row.weekday] = Boolean(row.close_time_next_day)
      return map
    },
    {}
  )

  return days.reduce<Record<string, boolean>>((map, day, index) => {
    if (index + 1 in nextDayByWeekday) {
      map[day.id] = nextDayByWeekday[index + 1]
    }

    return map
  }, {})
}

function mapShiftRowToWorkspaceShift(
  row: ShiftRowShape,
  days: WorkspaceDay[]
): WorkspaceShift {
  const dayId = getDayIdFromIsoDate(days, row.day_date)

  if (row.shift_type === "standard" && row.end_time) {
    return {
      id: row.id,
      dayId,
      zoneId: row.zone_id ?? getDeletedZoneId(row.zone_name_snapshot),
      zoneName: row.zone_name_snapshot,
      shiftType: "standard",
      startTime: formatDbTime(row.start_time),
      endTime: formatDbTime(row.end_time),
    }
  }

  if (row.shift_type === "closing") {
    return {
      id: row.id,
      dayId,
      zoneId: row.zone_id ?? getDeletedZoneId(row.zone_name_snapshot),
      zoneName: row.zone_name_snapshot,
      shiftType: "closing",
      startTime: formatDbTime(row.start_time),
      endKind: LOCATION_CLOSE_APP_VALUE,
    }
  }

  if (
    row.shift_type === "split" &&
    row.end_time &&
    row.split_second_start_time &&
    (row.split_second_end_time || isLocationCloseEndKind(row.end_kind))
  ) {
    return {
      id: row.id,
      dayId,
      zoneId: row.zone_id ?? getDeletedZoneId(row.zone_name_snapshot),
      zoneName: row.zone_name_snapshot,
      shiftType: "split",
      segments: [
        {
          startTime: formatDbTime(row.start_time),
          endTime: formatDbTime(row.end_time),
        },
        {
          startTime: formatDbTime(row.split_second_start_time),
          ...(isLocationCloseEndKind(row.end_kind)
            ? { endKind: LOCATION_CLOSE_APP_VALUE }
            : { endTime: formatDbTime(row.split_second_end_time ?? "") }),
        },
      ],
    }
  }

  throw new Error("We found a shift with incomplete saved data.")
}

function mapCreateShiftInputToShiftInsert(
  shift: CreateWorkspaceShiftInput,
  days: WorkspaceDay[]
) {
  const dayDate = getIsoDateFromDayId(days, shift.dayId)

  if (shift.shiftType === "standard") {
    return {
      day_date: dayDate,
      end_kind: null,
      end_time: shift.endTime,
      shift_type: "standard",
      split_second_end_time: null,
      split_second_start_time: null,
      start_time: shift.startTime,
      zone_id: shift.zoneId || null,
      zone_name_snapshot: shift.zoneName ?? "",
    }
  }

  if (shift.shiftType === "closing") {
    return {
      day_date: dayDate,
      end_kind: toDbEndKind(shift.endKind),
      end_time: null,
      shift_type: "closing",
      split_second_end_time: null,
      split_second_start_time: null,
      start_time: shift.startTime,
      zone_id: shift.zoneId || null,
      zone_name_snapshot: shift.zoneName ?? "",
    }
  }

  return {
    day_date: dayDate,
    end_kind: toDbEndKind(shift.segments[1].endKind),
    end_time: shift.segments[0].endTime,
    shift_type: "split",
    split_second_end_time:
      shift.segments[1].endKind === "locationClose"
        ? null
        : shift.segments[1].endTime,
    split_second_start_time: shift.segments[1].startTime,
    start_time: shift.segments[0].startTime,
    zone_id: shift.zoneId || null,
    zone_name_snapshot: shift.zoneName ?? "",
  }
}

function isLocationCloseEndKind(value: string | null) {
  return value === LOCATION_CLOSE_DB_VALUE || value === LOCATION_CLOSE_APP_VALUE
}

function toDbEndKind(value: "locationClose" | undefined | null) {
  return value === LOCATION_CLOSE_APP_VALUE ? LOCATION_CLOSE_DB_VALUE : null
}

function getDayIdFromIsoDate(days: WorkspaceDay[], isoDate: string | Date) {
  const normalizedIsoDate = normalizeIsoDateValue(isoDate)
  const exactDay = days.find((day) => day.isoDate === normalizedIsoDate)

  if (exactDay) {
    return exactDay.id
  }

  const weekdayIndex = getISODay(normalizeDateValue(isoDate)) - 1
  return days[weekdayIndex]?.id ?? `day-${normalizedIsoDate}`
}

function getIsoDateFromDayId(days: WorkspaceDay[], dayId: string) {
  const day = days.find((entry) => entry.id === dayId)

  if (!day) {
    const fallbackIsoDate = getIsoDateForEquivalentWeekday(days, dayId)

    if (!fallbackIsoDate) {
      throw new Error("Choose a valid day.")
    }

    return fallbackIsoDate
  }

  return day.isoDate
}

function getIsoDateForEquivalentWeekday(days: WorkspaceDay[], dayId: string) {
  const isoDate = dayId.startsWith("day-") ? dayId.slice(4) : null

  if (!isoDate) {
    return null
  }

  const weekdayIndex = getISODay(normalizeDateValue(isoDate)) - 1
  return days[weekdayIndex]?.isoDate ?? null
}

function formatDbTime(value: string) {
  return value.slice(0, 5)
}

function getDeletedZoneId(zoneName: string) {
  const normalizedName = zoneName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `deleted-zone:${normalizedName || "zone"}`
}

function normalizeDateValue(value: string | Date) {
  return value instanceof Date ? value : parseISO(value)
}

function normalizeIsoDateValue(value: string | Date) {
  return format(normalizeDateValue(value), "yyyy-MM-dd")
}

function buildWorkspaceLocation(
  location: {
    id: string
    name: string
    slug?: string
    estimatedClosingTime?: string | null
    estimatedClosingTimeNextDay?: boolean | null
  },
  days: WorkspaceDay[],
  operatingHours: OperatingHoursRowShape[]
): WorkspaceLocation {
  return {
    id: location.id,
    name: location.name,
    slug: location.slug,
    closeTimeByDayId: buildLocationCloseTimesByDayId(days, operatingHours),
    closeTimeNextDayByDayId: buildLocationCloseTimeNextDayByDayId(
      days,
      operatingHours
    ),
    estimatedCloseTime: formatDbTime(location.estimatedClosingTime ?? "23:00"),
    estimatedCloseTimeNextDay: Boolean(location.estimatedClosingTimeNextDay),
  }
}

export {
  buildWorkspaceDays,
  buildWorkspaceLocation,
  formatDbTime,
  getIsoDateFromDayId,
  mapCreateShiftInputToShiftInsert,
  mapShiftRowToWorkspaceShift,
}
export type { OperatingHoursRowShape, ShiftRowShape }
