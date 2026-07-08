import type {
  WorkspaceAssignment,
  WorkspaceDay,
  WorkspaceEmployee,
  WorkspaceLocation,
  WorkspaceShift,
  WorkspaceZone,
} from "@/features/rota/types/workspace"
import {
  getShiftDisplayLines,
  getShiftDurationMinutes,
} from "@/features/rota/utils/workspace-shifts"

type ScheduledCostSummaryInput = {
  allShiftIdsByDayId?: Partial<Record<string, Array<string>>>
  assignmentIdsByShiftId: Partial<Record<string, Array<string>>>
  assignmentsById: Partial<Record<string, WorkspaceAssignment>>
  days: Array<WorkspaceDay>
  employeesById: Partial<Record<string, WorkspaceEmployee>>
  location: WorkspaceLocation
  shiftIdsByDayId: Partial<Record<string, Array<string>>>
  shiftsById: Partial<Record<string, WorkspaceShift>>
}

type ScheduledDayCostSummary = {
  dayId: string
  totalCost: number
  totalMinutes: number
  totalShifts: number
}

type ScheduledZoneCostSummary = {
  totalCost: number
  totalMinutes: number
  totalShifts: number
  zoneId: string
  zoneName: string
}

type ScheduledShiftCostSummary = {
  assignedCount: number
  dayId: string
  timeLabel: string
  totalCost: number
  totalMinutes: number
  shiftId: string
  zoneId: string
  zoneName: string
}

function getScheduledCostSummaries(
  input: ScheduledCostSummaryInput
): ScheduledDayCostSummary[] {
  const totalMinutesByEmployeeId = getTotalMinutesByEmployeeId({
    ...input,
    shiftIdsByDayId: input.allShiftIdsByDayId ?? input.shiftIdsByDayId,
  })

  return input.days.map((day) => {
    let totalCostPence = 0
    let totalMinutes = 0
    const shiftIds = input.shiftIdsByDayId[day.id] ?? []

    for (const shiftId of shiftIds) {
      const shift = input.shiftsById[shiftId]
      if (!shift) continue
      const durationMinutes = getShiftDurationMinutes(shift, input.location)

      for (const assignmentId of input.assignmentIdsByShiftId[shiftId] ?? []) {
        const assignment = input.assignmentsById[assignmentId]
        const employee = assignment
          ? input.employeesById[assignment.employeeId]
          : undefined
        if (!employee) continue

        totalMinutes += durationMinutes
        totalCostPence += getAssignmentCostPence({
          durationMinutes,
          employee,
          employeeTotalMinutes:
            totalMinutesByEmployeeId[employee.id] ?? durationMinutes,
        })
      }
    }

    return {
      dayId: day.id,
      totalCost: totalCostPence / 100,
      totalMinutes,
      totalShifts: shiftIds.length,
    }
  })
}

function getScheduledZoneCostSummaries(
  input: ScheduledCostSummaryInput & { zones: WorkspaceZone[] }
): ScheduledZoneCostSummary[] {
  const totalMinutesByEmployeeId = getTotalMinutesByEmployeeId({
    ...input,
    shiftIdsByDayId: input.allShiftIdsByDayId ?? input.shiftIdsByDayId,
  })
  const summariesByZoneId = input.zones.reduce<
    Record<string, ScheduledZoneCostSummary>
  >((map, zone) => {
    map[zone.id] = createZoneSummary(zone.id, zone.name)
    return map
  }, {})

  for (const shiftIds of Object.values(input.shiftIdsByDayId)) {
    for (const shiftId of shiftIds ?? []) {
      const shift = input.shiftsById[shiftId]
      if (!shift) continue

      const summary =
        summariesByZoneId[shift.zoneId] ??
        createZoneSummary(shift.zoneId, shift.zoneName ?? "Unknown zone")
      const durationMinutes = getShiftDurationMinutes(shift, input.location)

      summary.totalCost +=
        getShiftCostPence({
          assignmentIds: input.assignmentIdsByShiftId[shiftId] ?? [],
          assignmentsById: input.assignmentsById,
          durationMinutes,
          employeesById: input.employeesById,
          totalMinutesByEmployeeId,
        }) / 100
      summary.totalMinutes += durationMinutes
      summary.totalShifts += 1
      summariesByZoneId[shift.zoneId] = summary
    }
  }

  return Object.values(summariesByZoneId).filter(
    (summary) => summary.totalShifts > 0 || summary.totalCost > 0
  )
}

function getScheduledShiftCostSummaries(
  input: ScheduledCostSummaryInput & { zones: WorkspaceZone[] }
): ScheduledShiftCostSummary[] {
  const totalMinutesByEmployeeId = getTotalMinutesByEmployeeId({
    ...input,
    shiftIdsByDayId: input.allShiftIdsByDayId ?? input.shiftIdsByDayId,
  })
  const zoneNameById = Object.fromEntries(
    input.zones.map((zone) => [zone.id, zone.name])
  )

  return Object.values(input.shiftIdsByDayId).flatMap((shiftIds) =>
    (shiftIds ?? []).flatMap((shiftId) => {
      const shift = input.shiftsById[shiftId]
      if (!shift) return []

      const assignmentIds = input.assignmentIdsByShiftId[shiftId] ?? []
      const durationMinutes = getShiftDurationMinutes(shift, input.location)
      const totalCost =
        getShiftCostPence({
          assignmentIds,
          assignmentsById: input.assignmentsById,
          durationMinutes,
          employeesById: input.employeesById,
          totalMinutesByEmployeeId,
        }) / 100

      return [
        {
          assignedCount: assignmentIds.length,
          dayId: shift.dayId,
          shiftId,
          timeLabel: getShiftDisplayLines(shift).join(", "),
          totalCost,
          totalMinutes: durationMinutes * assignmentIds.length,
          zoneId: shift.zoneId,
          zoneName: zoneNameById[shift.zoneId] ?? shift.zoneName ?? "Unknown zone",
        },
      ]
    })
  )
}

function getTotalMinutesByEmployeeId(input: ScheduledCostSummaryInput) {
  const totals: Record<string, number> = {}

  for (const shiftIds of Object.values(input.shiftIdsByDayId)) {
    if (!shiftIds) continue
    for (const shiftId of shiftIds) {
      const shift = input.shiftsById[shiftId]
      if (!shift) continue
      const durationMinutes = getShiftDurationMinutes(shift, input.location)

      for (const assignmentId of input.assignmentIdsByShiftId[shiftId] ?? []) {
        const employeeId = input.assignmentsById[assignmentId]?.employeeId
        if (!employeeId) continue
        totals[employeeId] = (totals[employeeId] ?? 0) + durationMinutes
      }
    }
  }

  return totals
}

function getShiftCostPence({
  assignmentIds,
  assignmentsById,
  durationMinutes,
  employeesById,
  totalMinutesByEmployeeId,
}: {
  assignmentIds: string[]
  assignmentsById: ScheduledCostSummaryInput["assignmentsById"]
  durationMinutes: number
  employeesById: ScheduledCostSummaryInput["employeesById"]
  totalMinutesByEmployeeId: Record<string, number>
}) {
  return assignmentIds.reduce((totalCostPence, assignmentId) => {
    const assignment = assignmentsById[assignmentId]
    const employee = assignment
      ? employeesById[assignment.employeeId]
      : undefined

    if (!employee) {
      return totalCostPence
    }

    return (
      totalCostPence +
      getAssignmentCostPence({
        durationMinutes,
        employee,
        employeeTotalMinutes:
          totalMinutesByEmployeeId[employee.id] ?? durationMinutes,
      })
    )
  }, 0)
}

function getAssignmentCostPence({
  durationMinutes,
  employee,
  employeeTotalMinutes,
}: {
  durationMinutes: number
  employee: WorkspaceEmployee
  employeeTotalMinutes: number
}) {
  if (employee.compensation.type === "hourly") {
    return (durationMinutes / 60) * employee.compensation.hourlyRatePence
  }

  return (
    employee.compensation.weeklySalaryPence *
    (durationMinutes / employeeTotalMinutes)
  )
}

function formatCurrency(
  value: number,
  options: {
    currency?: string
    locale?: string
  } = {}
) {
  return new Intl.NumberFormat(options.locale ?? "en-GB", {
    style: "currency",
    currency: options.currency ?? "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function createZoneSummary(
  zoneId: string,
  zoneName: string
): ScheduledZoneCostSummary {
  return {
    totalCost: 0,
    totalMinutes: 0,
    totalShifts: 0,
    zoneId,
    zoneName,
  }
}

export {
  formatCurrency,
  getScheduledCostSummaries,
  getScheduledShiftCostSummaries,
  getScheduledZoneCostSummaries,
}
export type {
  ScheduledCostSummaryInput,
  ScheduledDayCostSummary,
  ScheduledShiftCostSummary,
  ScheduledZoneCostSummary,
}
