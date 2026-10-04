import type {
  WorkspaceAssignment,
  WorkspaceBoardData,
  WorkspaceEmployee,
  WorkspaceShift,
} from "@/features/rota/types/workspace"

type AssignmentOverlapInput = {
  assignmentsById: Record<string, WorkspaceAssignment>
  days: WorkspaceBoardData["days"]
  location: WorkspaceBoardData["location"]
  shiftId: string
  shiftsById: Partial<Record<string, WorkspaceShift>>
}

type ShiftAssignmentOption = {
  employee: WorkspaceEmployee
  groupName: string
  disabledReason: string | null
}

export type { AssignmentOverlapInput, ShiftAssignmentOption }
