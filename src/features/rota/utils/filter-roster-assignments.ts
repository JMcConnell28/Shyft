import type {
  WorkspaceAssignment,
  WorkspaceEmployee,
} from "@/features/rota/types/workspace"

export function filterRosterAssignments(
  assignments: Record<string, WorkspaceAssignment>,
  employees: Record<string, WorkspaceEmployee>
): Record<string, WorkspaceAssignment> {
  return Object.fromEntries(
    Object.entries(assignments).filter(
      ([, assignment]) => assignment.employeeId in employees
    )
  )
}
