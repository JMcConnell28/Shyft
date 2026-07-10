import { addDays, format, parseISO } from "date-fns"

type PublishedShiftCandidate = {
  id: string
  day_date: string
  end_kind: string | null
  end_time: string | null
  shift_type: string
  split_second_end_time: string | null
  split_second_start_time: string | null
  start_time: string
  zone_name_snapshot: string
}

type ShiftMatch = {
  id: string
  segments: ShiftSegmentSummary[]
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
  shifts: PublishedShiftCandidate[],
  now: Date,
): ShiftMatch | null {
  const matches = shifts
    .map((shift) => toShiftMatch(shift))
    .filter((shift) => isWithinClockWindow(shift, now))
    .sort(
      (left, right) =>
        Math.abs(left.startsAt.getTime() - now.getTime()) -
        Math.abs(right.startsAt.getTime() - now.getTime()),
    )

  return matches.at(0) ?? null
}

function toShiftMatch(shift: PublishedShiftCandidate): ShiftMatch {
  const start = combineDateAndTime(shift.day_date, shift.start_time)
  const end = getShiftEnd(shift, start)

  return {
    id: shift.id,
    segments: getShiftSegments(shift),
    shiftType: shift.shift_type,
    startsAt: start,
    endsAt: end,
    timeLabel: getShiftTimeLabel(shift),
    zoneName: shift.zone_name_snapshot,
  }
}

function getShiftSegments(shift: PublishedShiftCandidate): ShiftSegmentSummary[] {
  const start = combineDateAndTime(shift.day_date, shift.start_time)

  if (shift.shift_type !== "split") {
    return [
      {
        endsAt: getShiftEnd(shift, start),
        key: "full",
        label: "Shift",
        startsAt: start,
        timeLabel: getShiftTimeLabel(shift),
      },
    ]
  }

  const firstEnd = getEndFromTime(start, shift.end_time)
  const secondStart = combineDateAndTime(
    format(firstEnd, "yyyy-MM-dd"),
    shift.split_second_start_time ?? shift.start_time,
  )
  const normalizedSecondStart =
    secondStart.getTime() < firstEnd.getTime()
      ? addDays(secondStart, 1)
      : secondStart

  return [
    {
      endsAt: firstEnd,
      key: "split_first",
      label: "First half",
      startsAt: start,
      timeLabel: `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`,
    },
    {
      endsAt: getEndFromTime(
        normalizedSecondStart,
        shift.split_second_end_time,
      ),
      key: "split_second",
      label: "Second half",
      startsAt: normalizedSecondStart,
      timeLabel: `${formatTime(shift.split_second_start_time)} - ${formatTime(
        shift.split_second_end_time,
      )}`,
    },
  ]
}

function isWithinClockWindow(shift: ShiftMatch, now: Date) {
  const earlyWindow = shift.startsAt.getTime() - 4 * 60 * 60 * 1000
  const lateWindow = shift.endsAt.getTime() + 4 * 60 * 60 * 1000

  return now.getTime() >= earlyWindow && now.getTime() <= lateWindow
}

function getShiftEnd(shift: PublishedShiftCandidate, start: Date) {
  if (shift.shift_type === "split") {
    return getEndFromTime(start, shift.split_second_end_time ?? shift.end_time)
  }

  if (shift.end_kind === "location_close" || !shift.end_time) {
    return addDays(start, 1)
  }

  return getEndFromTime(start, shift.end_time)
}

function getEndFromTime(start: Date, value: string | null) {
  if (!value) {
    return addDays(start, 1)
  }

  const end = combineDateAndTime(format(start, "yyyy-MM-dd"), value)
  return end.getTime() <= start.getTime() ? addDays(end, 1) : end
}

function combineDateAndTime(dateValue: string, timeValue: string) {
  const [hours = "0", minutes = "0"] = timeValue.split(":")
  const date = parseISO(dateValue)
  date.setHours(Number(hours), Number(minutes), 0, 0)
  return date
}

function getShiftTimeLabel(shift: PublishedShiftCandidate) {
  const start = formatTime(shift.start_time)

  if (shift.shift_type === "closing") {
    return `${start} - Close`
  }

  if (shift.shift_type === "split") {
    return `${start} - ${formatTime(shift.end_time)}, ${formatTime(
      shift.split_second_start_time,
    )} - ${formatTime(shift.split_second_end_time)}`
  }

  return `${start} - ${formatTime(shift.end_time)}`
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
  getShiftTimeLabel,
  toShiftMatch,
}
export type { PublishedShiftCandidate, ShiftMatch, ShiftSegmentSummary }
import type { ClockShiftSegment } from "@/features/time-clock/types"
