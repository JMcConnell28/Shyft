import type {
  WorkspaceAssignment,
  WorkspaceLocation,
  WorkspaceShift,
} from "@/features/rota/types/workspace"
import { getShiftDurationMinutes } from "@/features/rota/utils/workspace-shifts"

type RotaSummary = {
  scheduledHours: number
  scheduledStaffCount: number
  shiftCount: number
}

function calculateRotaSummary(input: {
  assignments: Array<Pick<WorkspaceAssignment, "employeeId" | "shiftId">>
  location: WorkspaceLocation
  shifts: Array<WorkspaceShift>
}): RotaSummary {
  const shiftsById = new Map(input.shifts.map((shift) => [shift.id, shift]))
  const validAssignments = input.assignments.filter((assignment) =>
    shiftsById.has(assignment.shiftId)
  )
  const uniqueEmployeeIds = new Set(
    validAssignments.map((assignment) => assignment.employeeId)
  )
  const totalMinutes = validAssignments.reduce((sum, assignment) => {
    const shift = shiftsById.get(assignment.shiftId)

    return shift ? sum + getShiftDurationMinutes(shift, input.location) : sum
  }, 0)

  return {
    scheduledHours: totalMinutes / 60,
    scheduledStaffCount: uniqueEmployeeIds.size,
    shiftCount: input.shifts.length,
  }
}

export { calculateRotaSummary }
export type { RotaSummary }
