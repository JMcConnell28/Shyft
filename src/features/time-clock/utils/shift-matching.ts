import { addDays, format, parseISO } from "date-fns"
import type { ClockShiftSegment } from "@/features/time-clock/types"
import {
  combineDateAndTimeInTimeZone,
  DEFAULT_CLOCK_TIME_ZONE,
  getDateKeyInTimeZone,
  getTimeInTimeZone,
} from "@/lib/time-zone"

type PublishedShiftCandidate = {
  id: string
  day_date: string
  end_kind: string | null
  end_time: string | null
  shift_type: string
  split_second_end_time: string | null
  split_second_start_time: string | null
  start_time: string
  time_zone: string
  zone_name_snapshot: string
}

type PublishedShiftClockTimes = Pick<
  PublishedShiftCandidate,
  | "end_kind"
  | "end_time"
  | "shift_type"
  | "split_second_end_time"
  | "split_second_start_time"
  | "start_time"
>

type ShiftMatch = {
  dayDate: string
  id: string
  segments: Array<ShiftSegmentSummary>
  shiftType: string
  startsAt: Date
  endsAt: Date
  timeLabel: string
  zoneName: string
}

type ShiftSegmentSummary = {
  endsAt: Date
  key: ClockShiftSegment
  label: string
  startsAt: Date
  timeLabel: string
}

function findBestShiftMatch(
  shifts: Array<PublishedShiftCandidate>,
  now: Date
): ShiftMatch | null {
  const matches = shifts
    .map((shift) => toShiftMatch(shift))
    .filter((shift) => isWithinClockWindow(shift, now))
    .sort(
      (left, right) =>
        Math.abs(left.startsAt.getTime() - now.getTime()) -
        Math.abs(right.startsAt.getTime() - now.getTime())
    )

  return matches.at(0) ?? null
}

function toShiftMatch(shift: PublishedShiftCandidate): ShiftMatch {
  const timeZone = shift.time_zone || DEFAULT_CLOCK_TIME_ZONE
  const segments = getShiftSegments(shift)
  const firstSegment = segments[0]
  const lastSegment = segments.at(-1)
  const start =
    firstSegment?.startsAt ??
    combineDateAndTimeInTimeZone(shift.day_date, shift.start_time, timeZone)
  const end = lastSegment?.endsAt ?? getShiftEnd(shift, start, timeZone)

  return {
    dayDate: shift.day_date,
    id: shift.id,
    segments,
    shiftType: shift.shift_type,
    startsAt: start,
    endsAt: end,
    timeLabel: getShiftTimeLabel(shift),
    zoneName: shift.zone_name_snapshot,
  }
}

function getShiftSegments(
  shift: PublishedShiftCandidate
): Array<ShiftSegmentSummary> {
  const timeZone = shift.time_zone || DEFAULT_CLOCK_TIME_ZONE
  const start = combineDateAndTimeInTimeZone(
    shift.day_date,
    shift.start_time,
    timeZone
  )

  if (shift.shift_type !== "split") {
    return [
      {
        endsAt: getShiftEnd(shift, start, timeZone),
        key: "full",
        label: "Shift",
        startsAt: start,
        timeLabel: getShiftTimeLabel(shift),
      },
    ]
  }

  const firstEnd = getEndFromTime(start, shift.end_time, timeZone)
  const secondStartTime = shift.split_second_start_time ?? shift.start_time
  const firstEndDate = getDateKeyInTimeZone(firstEnd, timeZone)
  const secondStartDate =
    secondStartTime.slice(0, 5) <= getTimeInTimeZone(firstEnd, timeZone)
      ? addCalendarDays(firstEndDate, 1)
      : firstEndDate
  const normalizedSecondStart = combineDateAndTimeInTimeZone(
    secondStartDate,
    secondStartTime,
    timeZone
  )

  return [
    {
      endsAt: firstEnd,
      key: "split_first",
      label: "First half",
      startsAt: start,
      timeLabel: getShiftSegmentTimeLabel(shift, "split_first"),
    },
    {
      endsAt: getEndFromTime(
        normalizedSecondStart,
        shift.split_second_end_time,
        timeZone
      ),
      key: "split_second",
      label: "Second half",
      startsAt: normalizedSecondStart,
      timeLabel: getShiftSegmentTimeLabel(shift, "split_second"),
    },
  ]
}

function isWithinClockWindow(shift: ShiftMatch, now: Date) {
  const earlyWindow = shift.startsAt.getTime() - 4 * 60 * 60 * 1000
  const lateWindow = shift.endsAt.getTime() + 4 * 60 * 60 * 1000

  return now.getTime() >= earlyWindow && now.getTime() <= lateWindow
}

function getShiftEnd(
  shift: PublishedShiftCandidate,
  start: Date,
  timeZone: string
) {
  if (shift.shift_type === "split") {
    return getEndFromTime(
      start,
      shift.split_second_end_time ?? shift.end_time,
      timeZone
    )
  }

  if (shift.end_kind === "location_close" || !shift.end_time) {
    const nextDay = addCalendarDays(getDateKeyInTimeZone(start, timeZone), 1)
    return combineDateAndTimeInTimeZone(
      nextDay,
      getTimeInTimeZone(start, timeZone),
      timeZone
    )
  }

  return getEndFromTime(start, shift.end_time, timeZone)
}

function getEndFromTime(start: Date, value: string | null, timeZone: string) {
  const startDate = getDateKeyInTimeZone(start, timeZone)

  if (!value) {
    return combineDateAndTimeInTimeZone(
      addCalendarDays(startDate, 1),
      getTimeInTimeZone(start, timeZone),
      timeZone
    )
  }

  const endDate =
    value.slice(0, 5) <= getTimeInTimeZone(start, timeZone)
      ? addCalendarDays(startDate, 1)
      : startDate

  return combineDateAndTimeInTimeZone(endDate, value, timeZone)
}

function addCalendarDays(dateValue: string, amount: number) {
  return format(addDays(parseISO(dateValue), amount), "yyyy-MM-dd")
}

function getShiftTimeLabel(shift: PublishedShiftClockTimes): string {
  const start = formatTime(shift.start_time)

  if (shift.shift_type === "closing") {
    return `${start} - Close`
  }

  if (shift.shift_type === "split") {
    return `${getShiftSegmentTimeLabel(shift, "split_first")}, ${getShiftSegmentTimeLabel(shift, "split_second")}`
  }

  return `${start} - ${formatTime(shift.end_time)}`
}

function getShiftSegmentTimeLabel(
  shift: PublishedShiftClockTimes,
  segment: ClockShiftSegment
): string {
  if (shift.shift_type !== "split" || segment === "full") {
    return getShiftTimeLabel(shift)
  }

  if (segment === "split_first") {
    return `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`
  }

  const end =
    shift.end_kind === "location_close"
      ? "Close"
      : formatTime(shift.split_second_end_time)

  return `${formatTime(shift.split_second_start_time)} - ${end}`
}

function formatShiftDate(value: string) {
  return format(parseISO(value), "EEE d MMM")
}

function formatTime(value: string | null) {
  return value?.slice(0, 5) ?? "--:--"
}

export {
  findBestShiftMatch,
  formatShiftDate,
  getShiftSegmentTimeLabel,
  getShiftTimeLabel,
  toShiftMatch,
}
export type { PublishedShiftCandidate, ShiftMatch, ShiftSegmentSummary }
