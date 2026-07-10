import type {
  WorkspaceAssignment,
  WorkspaceDay,
  WorkspaceEmployee,
  WorkspaceLocation,
  WorkspaceShift,
} from "@/features/rota/types/workspace"
import {
  getShiftDurationMinutes,
  getShiftPrimaryStart,
  getShiftSegments,
  getTimeMinutes,
} from "@/features/rota/utils/workspace-shifts"

type ZoneAppearance = {
  dotClassName: string
  badgeClassName: string
  cardClassName: string
}

type EmployeeMetric = {
  shiftCount: number
  scheduledMinutes: number
  weeklyContractMinutes: number
  utilizationPercent: number
  scheduleStatus: "under" | "balanced" | "over"
  warningCount: number
  availabilityConflictCount: number
  overlapConflictCount: number
}

type ShiftInsight = {
  assignedCount: number
  requiredCount: number
  openSlots: number
  isUnassigned: boolean
  isUnderstaffed: boolean
  warningCount: number
  availabilityConflictCount: number
  overlapConflictCount: number
}

type DayInsight = {
  openShiftCount: number
  understaffedShiftCount: number
  warningShiftCount: number
}

const zoneAppearancesById: Record<string, ZoneAppearance> = {
  "zone-bar": {
    dotClassName: "bg-amber-500",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-900",
    cardClassName: "border-l-amber-300",
  },
  "zone-floor": {
    dotClassName: "bg-sky-500",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-900",
    cardClassName: "border-l-sky-300",
  },
  "zone-kitchen": {
    dotClassName: "bg-rose-500",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-900",
    cardClassName: "border-l-rose-300",
  },
}

function getZoneAppearance(zoneId: string) {
  return (
    zoneAppearancesById[zoneId] ?? {
      dotClassName: "bg-neutral-400",
      badgeClassName: "border-border bg-muted text-foreground",
      cardClassName: "border-l-border",
    }
  )
}

function buildUnavailableEmployeeIdsByDayId(days: WorkspaceDay[]) {
  const unavailableByIndex: Record<number, string[]> = {
    1: ["emp-ava", "emp-remy"],
    3: ["emp-jack"],
    4: ["emp-leo"],
    6: ["emp-mohammed"],
  }

  return days.reduce<Record<string, Set<string>>>((map, day, index) => {
    map[day.id] = new Set(unavailableByIndex[index] ?? [])
    return map
  }, {})
}

function getRequiredStaffCount(shift: WorkspaceShift, dayIndex: number) {
  const isWeekend = dayIndex >= 4
  const startMinutes = getTimeMinutes(getShiftPrimaryStart(shift))
  const isLateShift = startMinutes >= 16 * 60
  const isBusyMidShift = startMinutes >= 12 * 60 && startMinutes < 17 * 60

  if (shift.zoneId === "zone-bar") {
    if (dayIndex === 5 && isLateShift) {
      return 3
    }

    return 2 + Number(isWeekend || isBusyMidShift)
  }

  if (shift.zoneId === "zone-floor") {
    return 2 + Number(isWeekend || isLateShift)
  }

  if (shift.zoneId === "zone-kitchen") {
    return 2 + Number(isWeekend && isLateShift)
  }

  return 2
}

function buildWorkspaceInsights({
  assignmentsById,
  days,
  employeesById,
  location,
  shiftsById,
}: {
  assignmentsById: Record<string, WorkspaceAssignment>
  days: WorkspaceDay[]
  employeesById: Record<string, WorkspaceEmployee>
  location: WorkspaceLocation
  shiftsById: Record<string, WorkspaceShift>
}) {
  const unavailableEmployeeIdsByDayId = buildUnavailableEmployeeIdsByDayId(days)
  const employeeMetricsById = Object.values(employeesById).reduce<
    Record<string, EmployeeMetric>
  >((map, employee) => {
    map[employee.id] = {
      shiftCount: 0,
      scheduledMinutes: 0,
      weeklyContractMinutes: employee.weeklyHours * 60,
      utilizationPercent: 0,
      scheduleStatus: "under",
      warningCount: 0,
      availabilityConflictCount: 0,
      overlapConflictCount: 0,
    }
    return map
  }, {})
  const shiftInsightsById = Object.values(shiftsById).reduce<
    Record<string, ShiftInsight>
  >((map, shift) => {
    const dayIndex = days.findIndex((day) => day.id === shift.dayId)
    const requiredCount = getRequiredStaffCount(shift, dayIndex)

    map[shift.id] = {
      assignedCount: 0,
      requiredCount,
      openSlots: requiredCount,
      isUnassigned: true,
      isUnderstaffed: true,
      warningCount: 0,
      availabilityConflictCount: 0,
      overlapConflictCount: 0,
    }
    return map
  }, {})
  const employeeShiftIntervals: Record<
    string,
    Array<{ assignmentId: string; dayId: string; shiftId: string; start: number; end: number }>
  > = {}
  const dayIndexById = days.reduce<Record<string, number>>((map, day, index) => {
    map[day.id] = index
    return map
  }, {})

  for (const assignment of Object.values(assignmentsById)) {
    const shift = shiftsById[assignment.shiftId]
    const employeeMetric = employeeMetricsById[assignment.employeeId]
    const shiftInsight = shift ? shiftInsightsById[shift.id] : null

    if (!shift || !employeeMetric || !shiftInsight) {
      continue
    }

    employeeMetric.shiftCount += 1
    employeeMetric.scheduledMinutes += getShiftDurationMinutes(shift, location)

    shiftInsight.assignedCount += 1

    const dayUnavailableEmployeeIds = unavailableEmployeeIdsByDayId[shift.dayId]

    if (dayUnavailableEmployeeIds?.has(assignment.employeeId)) {
      employeeMetric.availabilityConflictCount += 1
      shiftInsight.availabilityConflictCount += 1
    }

    const dayIndex = dayIndexById[shift.dayId] ?? 0
    const intervals = employeeShiftIntervals[assignment.employeeId] ?? []
    const segments = getShiftSegments(shift, location)

    for (const segment of segments) {
      intervals.push({
        assignmentId: assignment.id,
        dayId: shift.dayId,
        shiftId: shift.id,
        start: dayIndex * 24 * 60 + segment.startMinutes,
        end: dayIndex * 24 * 60 + segment.endMinutes,
      })
    }
    employeeShiftIntervals[assignment.employeeId] = intervals
  }

  for (const intervals of Object.values(employeeShiftIntervals)) {
    intervals.sort((left, right) => left.start - right.start)

    for (let index = 0; index < intervals.length - 1; index += 1) {
      const current = intervals[index]
      const next = intervals[index + 1]

      if (!current || !next || next.start >= current.end) {
        continue
      }

      const currentShiftInsight = shiftInsightsById[current.shiftId]
      const nextShiftInsight = shiftInsightsById[next.shiftId]
      const employeeId = assignmentsById[current.assignmentId]?.employeeId

      if (employeeId && employeeMetricsById[employeeId]) {
        employeeMetricsById[employeeId].overlapConflictCount += 1
      }

      if (currentShiftInsight) {
        currentShiftInsight.overlapConflictCount += 1
      }

      if (nextShiftInsight) {
        nextShiftInsight.overlapConflictCount += 1
      }
    }
  }

  for (const employeeMetric of Object.values(employeeMetricsById)) {
    employeeMetric.utilizationPercent = employeeMetric.weeklyContractMinutes
      ? Math.min(
          100,
          Math.round(
            (employeeMetric.scheduledMinutes / employeeMetric.weeklyContractMinutes) *
              100
          )
        )
      : 0
    employeeMetric.scheduleStatus =
      employeeMetric.scheduledMinutes > employeeMetric.weeklyContractMinutes
        ? "over"
        : employeeMetric.scheduledMinutes >= employeeMetric.weeklyContractMinutes * 0.8
          ? "balanced"
          : "under"
    employeeMetric.warningCount =
      employeeMetric.availabilityConflictCount +
      employeeMetric.overlapConflictCount
  }

  for (const shiftInsight of Object.values(shiftInsightsById)) {
    shiftInsight.isUnassigned = shiftInsight.assignedCount === 0
    shiftInsight.openSlots = Math.max(
      shiftInsight.requiredCount - shiftInsight.assignedCount,
      0
    )
    shiftInsight.isUnderstaffed = shiftInsight.openSlots > 0
    shiftInsight.warningCount =
      shiftInsight.availabilityConflictCount + shiftInsight.overlapConflictCount
  }

  const dayInsightsById = days.reduce<Record<string, DayInsight>>((map, day) => {
    const dayShiftInsights = Object.values(shiftsById)
      .filter((shift) => shift.dayId === day.id)
      .map((shift) => shiftInsightsById[shift.id])
      .filter((shiftInsight): shiftInsight is ShiftInsight => Boolean(shiftInsight))

    map[day.id] = {
      openShiftCount: dayShiftInsights.filter((shift) => shift.isUnassigned).length,
      understaffedShiftCount: dayShiftInsights.filter(
        (shift) => shift.isUnderstaffed
      ).length,
      warningShiftCount: dayShiftInsights.filter((shift) => shift.warningCount > 0)
        .length,
    }

    return map
  }, {})

  return {
    dayInsightsById,
    employeeMetricsById,
    shiftInsightsById,
    unavailableEmployeeIdsByDayId,
  }
}

export { buildWorkspaceInsights, getZoneAppearance }
