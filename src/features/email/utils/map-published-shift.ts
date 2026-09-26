import type {
  PublishedShiftDetails,
  RotaPublishedShift,
} from "@/features/email/types/rota-published"
import {
  getTimeMinutes,
  normalizeShiftEnd,
} from "@/features/rota/utils/workspace-shifts"

function mapPublishedShift(row: PublishedShiftDetails): RotaPublishedShift {
  const startTime = formatClockTime(row.shift_start_time)
  const closeTime = formatClockTime(
    row.location_close_time ?? row.estimated_closing_time
  )
  const closeNextDay = row.location_close_time
    ? Boolean(row.location_close_time_next_day)
    : row.estimated_closing_time_next_day

  if (row.shift_type === "closing") {
    return {
      dayDate: row.shift_day_date,
      durationMinutes: getSegmentMinutes(startTime, closeTime, closeNextDay),
      timeLabel: `${startTime} – Close`,
      zoneName: row.zone_name,
    }
  }

  const endTime = formatRequiredTime(row.shift_end_time)
  const firstDuration = getSegmentMinutes(startTime, endTime)

  if (row.shift_type === "split") {
    const secondStart = formatRequiredTime(row.shift_split_second_start_time)
    const secondEndsAtClose = row.shift_end_kind === "location_close"
    const secondEnd = secondEndsAtClose
      ? closeTime
      : formatRequiredTime(row.shift_split_second_end_time)

    return {
      dayDate: row.shift_day_date,
      durationMinutes:
        firstDuration +
        getSegmentMinutes(
          secondStart,
          secondEnd,
          secondEndsAtClose && closeNextDay
        ),
      timeLabel: `${startTime} – ${endTime}, ${secondStart} – ${secondEndsAtClose ? "Close" : secondEnd}`,
      zoneName: row.zone_name,
    }
  }

  return {
    dayDate: row.shift_day_date,
    durationMinutes: firstDuration,
    timeLabel: `${startTime} – ${endTime}`,
    zoneName: row.zone_name,
  }
}

function getSegmentMinutes(
  startTime: string,
  endTime: string,
  nextDay = false
) {
  return (
    normalizeShiftEnd(startTime, endTime, nextDay) - getTimeMinutes(startTime)
  )
}

function formatRequiredTime(value: string | null): string {
  if (!value) throw new Error("A published shift has incomplete times.")
  return formatClockTime(value)
}

function formatClockTime(value: string): string {
  return value.slice(0, 5)
}

export { mapPublishedShift }
