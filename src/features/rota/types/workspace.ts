import type { StaffGroupColor } from "@/features/staff-groups/constants/staff-group-colors"
import type { RotaTemplateSummary } from "@/features/rota/types"

type WorkspaceLocation = {
  id: string
  name: string
  slug?: string
  closeTimeByDayId: Record<string, string>
  closeTimeNextDayByDayId: Record<string, boolean>
  estimatedCloseTime: string
  estimatedCloseTimeNextDay: boolean
}

type WorkspaceZone = {
  id: string
  name: string
}

type WorkspaceDay = {
  id: string
  isoDate: string
  shortLabel: string
  dayNumber: string
  monthLabel: string
}

type WorkspaceEmployee = {
  id: string
  name: string
  groupId: string
  groupColor: StaffGroupColor
  weeklyHours: number
}

type WorkspaceEmployeeGroup = {
  id: string
  name: string
  color: StaffGroupColor
}

type WorkspaceShiftSegment = {
  startTime: string
  endTime?: string
  endKind?: "locationClose"
}

type WorkspaceStandardShift = {
  id: string
  dayId: string
  zoneId: string
  zoneName?: string
  shiftType: "standard"
  startTime: string
  endTime: string
}

type WorkspaceClosingShift = {
  id: string
  dayId: string
  zoneId: string
  zoneName?: string
  shiftType: "closing"
  startTime: string
  endKind: "locationClose"
}

type WorkspaceSplitShift = {
  id: string
  dayId: string
  zoneId: string
  zoneName?: string
  shiftType: "split"
  segments: [WorkspaceShiftSegment, WorkspaceShiftSegment]
}

type WorkspaceShift =
  | WorkspaceStandardShift
  | WorkspaceClosingShift
  | WorkspaceSplitShift

type WorkspaceAssignment = {
  id: string
  employeeId: string
  shiftId: string
}

type CreateWorkspaceStandardShiftInput = Omit<WorkspaceStandardShift, "id">
type CreateWorkspaceClosingShiftInput = Omit<WorkspaceClosingShift, "id">
type CreateWorkspaceSplitShiftInput = Omit<WorkspaceSplitShift, "id">

type CreateWorkspaceShiftInput =
  | CreateWorkspaceStandardShiftInput
  | CreateWorkspaceClosingShiftInput
  | CreateWorkspaceSplitShiftInput

type WorkspaceDragData =
  | {
      type: "employee"
      employeeId: string
    }
  | {
      type: "assignment"
      assignmentId: string
      employeeId: string
    }

type WorkspaceAssignmentMutationResult =
  | {
      status: "success"
    }
  | {
      status: "noop"
    }
  | {
      status: "overlap"
      employeeName: string
      dayLabel: string
      zoneName: string
    }

type WorkspaceBoardMeta = {
  rotaId: string
  status: "draft" | "published"
  note: string | null
  weekStart: string
  weekEnd: string
  weekLabel: string
  publishedVersion: number
  hasUnpublishedChanges: boolean
  publishedSnapshotAvailable: boolean
}

type WorkspaceBoardData = {
  meta: WorkspaceBoardMeta
  location: WorkspaceLocation
  days: WorkspaceDay[]
  zones: WorkspaceZone[]
  employeeGroups: WorkspaceEmployeeGroup[]
  employees: WorkspaceEmployee[]
  shifts: WorkspaceShift[]
  assignments: WorkspaceAssignment[]
  templates: RotaTemplateSummary[]
}

export type {
  CreateWorkspaceShiftInput,
  CreateWorkspaceClosingShiftInput,
  CreateWorkspaceSplitShiftInput,
  CreateWorkspaceStandardShiftInput,
  WorkspaceAssignment,
  WorkspaceAssignmentMutationResult,
  WorkspaceBoardData,
  WorkspaceBoardMeta,
  WorkspaceDay,
  WorkspaceDragData,
  WorkspaceEmployee,
  WorkspaceEmployeeGroup,
  WorkspaceShiftSegment,
  WorkspaceLocation,
  WorkspaceClosingShift,
  WorkspaceSplitShift,
  WorkspaceStandardShift,
  WorkspaceShift,
  WorkspaceZone,
}
