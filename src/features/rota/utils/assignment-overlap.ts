import type {
  WorkspaceAssignment,
  WorkspaceAssignmentMutationResult,
  WorkspaceBoardData,
  WorkspaceEmployee,
} from "@/features/rota/types/workspace"
import type { AssignmentOverlapInput } from "@/features/rota/types/shift-assignment"
import { getShiftAbsoluteSegments } from "@/features/rota/utils/workspace-shifts"

function getOverlappingAssignments({
  assignmentsById,
  days,
  location,
  shiftId,
  shiftsById,
}: AssignmentOverlapInput): Array<WorkspaceAssignment> {
  const targetShift = shiftsById[shiftId]
  if (!targetShift) return []

  const targetSegments = getShiftAbsoluteSegments(targetShift, {
    days,
    location,
  })
  const overlapByShiftId = new Map<string, boolean>()

  return Object.values(assignmentsById).filter((assignment) => {
    const cached = overlapByShiftId.get(assignment.shiftId)
    if (cached !== undefined) return cached

    const existingShift = shiftsById[assignment.shiftId]
    const overlaps = existingShift
      ? getShiftAbsoluteSegments(existingShift, { days, location }).some(
          (existing) =>
            targetSegments.some(
              (target) =>
                existing.startMinutes < target.endMinutes &&
                target.startMinutes < existing.endMinutes
            )
        )
      : false
    overlapByShiftId.set(assignment.shiftId, overlaps)
    return overlaps
  })
}

function getAssignmentOverlapResult(
  input: AssignmentOverlapInput & {
    employeeId: string
    employeesById: Partial<Record<string, WorkspaceEmployee>>
    excludeAssignmentId?: string
    zones: WorkspaceBoardData["zones"]
  }
): WorkspaceAssignmentMutationResult | null {
  const hasOverlap = getOverlappingAssignments(input).some(
    (assignment) =>
      assignment.employeeId === input.employeeId &&
      assignment.id !== input.excludeAssignmentId
  )
  const shift = input.shiftsById[input.shiftId]
  if (!hasOverlap || !shift) return null

  return {
    status: "overlap",
    employeeName:
      input.employeesById[input.employeeId]?.name ?? "This team member",
    dayLabel:
      input.days.find((day) => day.id === shift.dayId)?.shortLabel ??
      "that day",
    zoneName:
      input.zones.find((zone) => zone.id === shift.zoneId)?.name ??
      shift.zoneName ??
      "this zone",
  }
}

export { getAssignmentOverlapResult, getOverlappingAssignments }
