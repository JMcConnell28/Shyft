import type {
  WorkspaceDay,
  WorkspaceLocation,
  WorkspaceShift,
  WorkspaceShiftSegment,
} from "@/features/rota/types/workspace"

type ResolvedWorkspaceShiftSegment = WorkspaceShiftSegment & {
  startMinutes: number
  endMinutes: number
}

function getShiftSegments(
  shift: WorkspaceShift,
  location: WorkspaceLocation
): ResolvedWorkspaceShiftSegment[] {
  if (shift.shiftType === "standard") {
    return [resolveSegment({ startTime: shift.startTime, endTime: shift.endTime })]
  }

  if (shift.shiftType === "closing") {
    const dayCloseTime = location.closeTimeByDayId[shift.dayId]
    const dayCloseTimeNextDay = location.closeTimeNextDayByDayId[shift.dayId]
    const closeTime = dayCloseTime ?? location.estimatedCloseTime

    return [
      resolveSegment(
        { startTime: shift.startTime, endTime: closeTime },
        dayCloseTime ? Boolean(dayCloseTimeNextDay) : location.estimatedCloseTimeNextDay
      ),
    ]
  }

  return shift.segments.map((segment) => {
    if (segment.endKind === "locationClose") {
      const dayCloseTime = location.closeTimeByDayId[shift.dayId]
      const dayCloseTimeNextDay = location.closeTimeNextDayByDayId[shift.dayId]
      const closeTime = dayCloseTime ?? location.estimatedCloseTime

      return resolveSegment(
        {
          startTime: segment.startTime,
          endTime: closeTime,
          endKind: segment.endKind,
        },
        dayCloseTime
          ? Boolean(dayCloseTimeNextDay)
          : location.estimatedCloseTimeNextDay
      )
    }

    return resolveSegment({
      startTime: segment.startTime,
      endTime: segment.endTime ?? segment.startTime,
    })
  })
}

function getShiftDurationMinutes(
  shift: WorkspaceShift,
  location: WorkspaceLocation
) {
  return getShiftSegments(shift, location).reduce(
    (total, segment) => total + (segment.endMinutes - segment.startMinutes),
    0
  )
}

function getShiftSortStart(
  shift: WorkspaceShift,
  location: WorkspaceLocation
) {
  return getShiftSegments(shift, location)[0]?.startMinutes ?? Number.MAX_SAFE_INTEGER
}

function getShiftDisplayLines(shift: WorkspaceShift) {
  if (shift.shiftType === "standard") {
    return [`${shift.startTime} - ${shift.endTime}`]
  }

  if (shift.shiftType === "closing") {
    return [`${shift.startTime} - Close`]
  }

  return shift.segments.map((segment) =>
    segment.endKind === "locationClose"
      ? `${segment.startTime} - Close`
      : `${segment.startTime} - ${segment.endTime ?? segment.startTime}`
  )
}

function getShiftPrimaryStart(shift: WorkspaceShift) {
  if (shift.shiftType === "split") {
    return shift.segments[0]?.startTime ?? "00:00"
  }

  return shift.startTime
}

function getWeekdayCloseTime(
  location: WorkspaceLocation,
  dayId: WorkspaceDay["id"]
) {
  return location.closeTimeByDayId[dayId] ?? location.estimatedCloseTime
}

function shiftsOverlap(
  left: WorkspaceShift,
  right: WorkspaceShift,
  location: WorkspaceLocation
) {
  const leftSegments = getShiftSegments(left, location)
  const rightSegments = getShiftSegments(right, location)

  return leftSegments.some((leftSegment) =>
    rightSegments.some(
      (rightSegment) =>
        leftSegment.startMinutes < rightSegment.endMinutes &&
        rightSegment.startMinutes < leftSegment.endMinutes
    )
  )
}

function getTimeMinutes(value: string) {
  const [hoursText = "0", minutesText = "0"] = value.split(":")
  const hours = Number.parseInt(hoursText, 10)
  const minutes = Number.parseInt(minutesText, 10)

  return hours * 60 + minutes
}

function getShiftAbsoluteSegments(
  shift: WorkspaceShift,
  options: {
    days: WorkspaceDay[]
    location: WorkspaceLocation
  }
) {
  const dayIndex = options.days.findIndex((day) => day.id === shift.dayId)
  const dayOffset = Math.max(dayIndex, 0) * 24 * 60

  return getShiftSegments(shift, options.location).map((segment) => ({
    ...segment,
    startMinutes: dayOffset + segment.startMinutes,
    endMinutes: dayOffset + segment.endMinutes,
  }))
}

function resolveSegment(
  segment: WorkspaceShiftSegment & { endTime: string },
  forceNextDay = false
): ResolvedWorkspaceShiftSegment {
  const startMinutes = getTimeMinutes(segment.startTime)
  const endMinutes = normalizeShiftEnd(
    segment.startTime,
    segment.endTime,
    forceNextDay
  )

  return {
    ...segment,
    startMinutes,
    endMinutes,
  }
}

function normalizeShiftEnd(
  startTime: string,
  endTime: string,
  forceNextDay = false
) {
  const startMinutes = getTimeMinutes(startTime)
  const endMinutes = getTimeMinutes(endTime)

  if (forceNextDay) {
    return endMinutes + 24 * 60
  }

  return endMinutes > startMinutes ? endMinutes : endMinutes + 24 * 60
}

export {
  getShiftAbsoluteSegments,
  getShiftDisplayLines,
  getShiftDurationMinutes,
  getShiftPrimaryStart,
  getShiftSegments,
  getShiftSortStart,
  getTimeMinutes,
  getWeekdayCloseTime,
  normalizeShiftEnd,
  shiftsOverlap,
}
export type { ResolvedWorkspaceShiftSegment }
