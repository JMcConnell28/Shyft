import type {
  WorkspaceBoardData,
  WorkspaceEmployee,
} from "@/features/rota/types/workspace"
import type {
  AssignmentOverlapInput,
  ShiftAssignmentOption,
} from "@/features/rota/types/shift-assignment"
import { getOverlappingAssignments } from "@/features/rota/utils/assignment-overlap"

function buildShiftAssignmentOptions(
  input: AssignmentOverlapInput & {
    employees: Array<WorkspaceEmployee>
    employeeGroups: WorkspaceBoardData["employeeGroups"]
  }
): Array<ShiftAssignmentOption> {
  const assignedEmployeeIds = new Set(
    Object.values(input.assignmentsById)
      .filter((assignment) => assignment.shiftId === input.shiftId)
      .map((assignment) => assignment.employeeId)
  )
  const overlappingEmployeeIds = new Set(
    getOverlappingAssignments(input).map((assignment) => assignment.employeeId)
  )
  const groupNames = new Map(
    input.employeeGroups.map((group) => [group.id, group.name])
  )

  return input.employees
    .map((employee) => ({
      employee,
      groupName: groupNames.get(employee.groupId) ?? "Ungrouped",
      disabledReason: !input.shiftsById[input.shiftId]
        ? "Shift no longer available"
        : assignedEmployeeIds.has(employee.id)
          ? "Already assigned"
          : overlappingEmployeeIds.has(employee.id)
            ? "Overlapping shift"
            : null,
    }))
    .sort((left, right) =>
      left.employee.name.localeCompare(right.employee.name)
    )
}

export { buildShiftAssignmentOptions }
