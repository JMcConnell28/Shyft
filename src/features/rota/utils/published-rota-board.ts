import type {
  WorkspaceAssignment,
  WorkspaceBoardData,
  WorkspaceEmployee,
  WorkspaceShift,
} from "@/features/rota/types/workspace"
import { compareShiftsByTime } from "@/features/rota/utils/workspace-shifts"

type PublishedRotaBoardIndex = {
  assignmentsByShiftId: Partial<Record<string, Array<WorkspaceAssignment>>>
  employeesById: Partial<Record<string, WorkspaceEmployee>>
  shiftsByDayId: Partial<Record<string, Array<WorkspaceShift>>>
}

function buildPublishedRotaBoardIndex(
  boardData: WorkspaceBoardData,
  selectedZoneId: string | null
): PublishedRotaBoardIndex {
  const shiftsByDayId: Record<string, Array<WorkspaceShift>> = {}
  const assignmentsByShiftId: Record<string, Array<WorkspaceAssignment>> = {}

  for (const shift of boardData.shifts) {
    if (shift.zoneId !== selectedZoneId) continue
    const dayShifts = (shiftsByDayId[shift.dayId] ??= [])
    dayShifts.push(shift)
  }

  for (const shifts of Object.values(shiftsByDayId)) {
    shifts.sort((left, right) =>
      compareShiftsByTime(left, right, boardData.location)
    )
  }

  for (const assignment of boardData.assignments) {
    const shiftAssignments = (assignmentsByShiftId[assignment.shiftId] ??= [])
    shiftAssignments.push(assignment)
  }

  return {
    assignmentsByShiftId,
    employeesById: Object.fromEntries(
      boardData.employees.map((employee) => [employee.id, employee])
    ),
    shiftsByDayId,
  }
}

export { buildPublishedRotaBoardIndex }
export type { PublishedRotaBoardIndex }
