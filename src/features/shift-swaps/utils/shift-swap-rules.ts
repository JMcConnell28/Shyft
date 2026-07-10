type ShiftSwapStatus =
  | "awaiting_peer"
  | "open"
  | "pending_manager"
  | "approved"
  | "denied"
  | "cancelled"
  | "expired"

type ShiftSwapCandidateShift = {
  date: string
  endKind: string | null
  endTime: string | null
  shiftType: string
  splitSecondEndTime: string | null
  splitSecondStartTime: string | null
  startTime: string
}

type ShiftSwapSegment = {
  startsAt: Date
  endsAt: Date
}

const ACTIVE_SHIFT_SWAP_STATUSES = [
  "awaiting_peer",
  "open",
  "pending_manager",
] satisfies readonly ShiftSwapStatus[]

const TERMINAL_SHIFT_SWAP_STATUSES = [
  "approved",
  "denied",
  "cancelled",
  "expired",
] satisfies readonly ShiftSwapStatus[]

const SHIFT_SWAP_CUTOFF_HOURS = 2

function isActiveShiftSwapStatus(status: ShiftSwapStatus) {
  return (ACTIVE_SHIFT_SWAP_STATUSES as readonly ShiftSwapStatus[]).includes(status)
}

function isTerminalShiftSwapStatus(status: ShiftSwapStatus) {
  return (TERMINAL_SHIFT_SWAP_STATUSES as readonly ShiftSwapStatus[]).includes(status)
}

function getShiftSwapCutoffAt(startsAt: Date) {
  return new Date(startsAt.getTime() - SHIFT_SWAP_CUTOFF_HOURS * 60 * 60 * 1000)
}

function isPastShiftSwapCutoff(cutoffAt: Date, now = new Date()) {
  return now.getTime() >= cutoffAt.getTime()
}

function hasCompatibleStaffGroup(
  leftStaffGroupId: string | null,
  rightStaffGroupId: string | null
) {
  return leftStaffGroupId === rightStaffGroupId
}

function getShiftSwapSegments(shift: ShiftSwapCandidateShift) {
  const start = combineDateAndTime(shift.date, shift.startTime)

  if (shift.shiftType === "split") {
    const firstEnd = getSegmentEnd(start, shift.endTime)
    const secondStart = normalizeStartAfter(
      combineDateAndTime(
        toIsoDate(firstEnd),
        shift.splitSecondStartTime ?? shift.startTime
      ),
      firstEnd
    )

    return [
      {
        startsAt: start,
        endsAt: firstEnd,
      },
      {
        startsAt: secondStart,
        endsAt: getSegmentEnd(secondStart, shift.splitSecondEndTime),
      },
    ] satisfies ShiftSwapSegment[]
  }

  return [
    {
      startsAt: start,
      endsAt:
        shift.endKind === "location_close"
          ? addDays(start, 1)
          : getSegmentEnd(start, shift.endTime),
    },
  ] satisfies ShiftSwapSegment[]
}

function shiftsOverlap(
  left: ShiftSwapCandidateShift,
  right: ShiftSwapCandidateShift
) {
  return segmentsOverlap(getShiftSwapSegments(left), getShiftSwapSegments(right))
}

function segmentsOverlap(left: ShiftSwapSegment[], right: ShiftSwapSegment[]) {
  return left.some((leftSegment) =>
    right.some(
      (rightSegment) =>
        leftSegment.startsAt.getTime() < rightSegment.endsAt.getTime() &&
        rightSegment.startsAt.getTime() < leftSegment.endsAt.getTime()
    )
  )
}

function combineDateAndTime(dateValue: string, timeValue: string) {
  const [hours = "0", minutes = "0"] = timeValue.split(":")
  const date = new Date(`${dateValue}T00:00:00`)
  date.setHours(Number(hours), Number(minutes), 0, 0)
  return date
}

function getSegmentEnd(start: Date, value: string | null) {
  if (!value) {
    return addDays(start, 1)
  }

  return normalizeStartAfter(combineDateAndTime(toIsoDate(start), value), start)
}

function normalizeStartAfter(value: Date, minimum: Date) {
  return value.getTime() <= minimum.getTime() ? addDays(value, 1) : value
}

function addDays(value: Date, days: number) {
  const nextValue = new Date(value)
  nextValue.setDate(nextValue.getDate() + days)
  return nextValue
}

function toIsoDate(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export {
  ACTIVE_SHIFT_SWAP_STATUSES,
  SHIFT_SWAP_CUTOFF_HOURS,
  TERMINAL_SHIFT_SWAP_STATUSES,
  getShiftSwapCutoffAt,
  getShiftSwapSegments,
  hasCompatibleStaffGroup,
  isActiveShiftSwapStatus,
  isPastShiftSwapCutoff,
  isTerminalShiftSwapStatus,
  shiftsOverlap,
}
export type { ShiftSwapCandidateShift, ShiftSwapSegment, ShiftSwapStatus }
