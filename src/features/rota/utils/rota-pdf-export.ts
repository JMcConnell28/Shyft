import { format } from "date-fns"

import type {
  WorkspaceAssignment,
  WorkspaceBoardMeta,
  WorkspaceDay,
  WorkspaceEmployee,
  WorkspaceEmployeeGroup,
  WorkspaceLocation,
  WorkspaceShift,
  WorkspaceZone,
} from "@/features/rota/types/workspace"
import type {
  RotaPdfDocumentData,
  RotaPdfExportOptions,
} from "@/features/rota/types/rota-pdf"
import { getStaffGroupColorAppearance } from "@/features/staff-groups/constants/staff-group-colors"
import {
  formatCurrency,
  getScheduledCostSummaries,
} from "@/features/rota/utils/workspace-budget"
import {
  getShiftDisplayLines,
  getShiftDurationMinutes,
  getShiftSortStart,
} from "@/features/rota/utils/workspace-shifts"
import { formatMinutesAsHours } from "@/features/rota/utils/workspace-time"

function buildRotaPdfDocumentData(input: {
  assignmentIdsByShiftId: Record<string, string[]>
  assignmentsById: Record<string, WorkspaceAssignment>
  brandLogoUrl: string | null
  days: WorkspaceDay[]
  employeeGroups: Array<WorkspaceEmployeeGroup & { employeeIds?: string[] }>
  employeesById: Record<string, WorkspaceEmployee>
  location: WorkspaceLocation
  meta: WorkspaceBoardMeta
  options: RotaPdfExportOptions
  shiftsById: Record<string, WorkspaceShift>
  zones: WorkspaceZone[]
}): RotaPdfDocumentData {
  const pages = input.zones.map((zone) =>
    buildZonePage({
      ...input,
      zone,
    })
  )

  return {
    brandLogoUrl: input.brandLogoUrl,
    fileName: buildRotaPdfFileName(input.location.name, input.meta.weekStart),
    generatedAtLabel: format(new Date(), "d MMM yyyy, HH:mm"),
    locationName: input.location.name,
    note: input.meta.note,
    options: input.options,
    pages,
    weekLabel: input.meta.weekLabel,
  }
}

function buildRotaPdfFileName(locationName: string, weekStart: string) {
  const slug = locationName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `rocketrota-${slug || "location"}-${weekStart}.pdf`
}

function buildZonePage(
  input: Parameters<typeof buildRotaPdfDocumentData>[0] & {
    zone: WorkspaceZone
  }
) {
  const zoneShiftEntries = Object.values(input.shiftsById)
    .filter((shift) => shift.zoneId === input.zone.id)
    .sort(
      (left, right) =>
        getShiftSortStart(left, input.location) -
        getShiftSortStart(right, input.location)
    )

  const days = input.days.map((day) => ({
    dateLabel: `${day.dayNumber} ${day.monthLabel}`,
    id: day.id,
    label: day.shortLabel,
    shifts: zoneShiftEntries
      .filter((shift) => shift.dayId === day.id)
      .map((shift) => ({
        employees: (input.assignmentIdsByShiftId[shift.id] ?? [])
          .map((assignmentId) => input.assignmentsById[assignmentId])
          .filter((assignment): assignment is WorkspaceAssignment =>
            Boolean(assignment)
          )
          .map((assignment) => input.employeesById[assignment.employeeId])
          .filter((employee): employee is WorkspaceEmployee =>
            Boolean(employee)
          )
          .sort((left, right) => left.name.localeCompare(right.name))
          .map((employee) => {
            const group = input.employeeGroups.find(
              (entry) => entry.id === employee.groupId
            )
            const groupColorHex = getStaffGroupColorAppearance(
              employee.groupColor
            ).pdfHexColor
            const badgeText = getGroupBadgeText(
              group?.name ?? "Team",
              input.employeeGroups
                .map((entry) => entry.name)
                .filter((entry): entry is string => Boolean(entry))
            )

            return {
              badgeText,
              groupId: employee.groupId,
              groupColorHex,
              groupName: group?.name ?? "Team",
              id: employee.id,
              name: employee.name,
            }
          }),
        id: shift.id,
        timeLines: getShiftDisplayLines(shift),
      })),
  }))

  const legend = Array.from(
    new Map(
      days
        .flatMap((day) => day.shifts)
        .flatMap((shift) => shift.employees)
        .map((employee) => [
          employee.groupId,
          {
            badgeText: employee.badgeText,
            colorHex: employee.groupColorHex,
            id: employee.groupId,
            name: employee.groupName,
          },
        ])
    ).values()
  )

  const totalMinutes = zoneShiftEntries.reduce((sum, shift) => {
    const assignedCount = (input.assignmentIdsByShiftId[shift.id] ?? []).length

    return sum + assignedCount * getShiftDurationMinutes(shift, input.location)
  }, 0)
  const zoneShiftIds = new Set(zoneShiftEntries.map((shift) => shift.id))
  const shiftIdsByDayId = input.days.reduce<Record<string, string[]>>(
    (map, day) => {
      map[day.id] = Object.values(input.shiftsById)
        .filter((shift) => shift.dayId === day.id && zoneShiftIds.has(shift.id))
        .map((shift) => shift.id)
      return map
    },
    {}
  )
  const allShiftIdsByDayId = input.days.reduce<Record<string, string[]>>(
    (map, day) => {
      map[day.id] = Object.values(input.shiftsById)
        .filter((shift) => shift.dayId === day.id)
        .map((shift) => shift.id)
      return map
    },
    {}
  )
  const totalCost = getScheduledCostSummaries({
    allShiftIdsByDayId,
    assignmentIdsByShiftId: input.assignmentIdsByShiftId,
    assignmentsById: input.assignmentsById,
    days: input.days,
    employeesById: input.employeesById,
    location: input.location,
    shiftIdsByDayId,
    shiftsById: input.shiftsById,
  }).reduce((sum, day) => sum + day.totalCost, 0)

  return {
    days,
    legend,
    totalCostLabel: formatCurrency(totalCost),
    totalHoursLabel: formatMinutesAsHours(totalMinutes),
    totalShiftCount: zoneShiftEntries.length,
    zoneId: input.zone.id,
    zoneName: input.zone.name,
  }
}

function getGroupBadgeText(groupName: string, allGroupNames: string[]) {
  const words = groupName.trim().split(/\s+/).filter(Boolean)

  const primary = words[0]?.[0]?.toUpperCase() ?? "T"
  const hasCollision =
    allGroupNames.filter((name) => {
      const comparisonWords = name.trim().split(/\s+/).filter(Boolean)

      return (comparisonWords[0]?.[0]?.toUpperCase() ?? "T") === primary
    }).length > 1

  if (!hasCollision) {
    return primary
  }

  if (words.length > 1) {
    return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase()
  }

  return groupName.slice(0, 2).toUpperCase()
}

export { buildRotaPdfDocumentData, buildRotaPdfFileName }
