type WorkspaceLocation = {
  id: string
  name: string
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
  weeklyHours: number
}

type WorkspaceEmployeeGroup = {
  id: string
  name: string
}

type WorkspaceShift = {
  id: string
  dayId: string
  zoneId: string
  startTime: string
  endTime: string
}

type WorkspaceAssignment = {
  id: string
  employeeId: string
  shiftId: string
}

type CreateWorkspaceShiftInput = {
  dayId: string
  zoneId: string
  startTime: string
  endTime: string
}

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

export type {
  CreateWorkspaceShiftInput,
  WorkspaceAssignment,
  WorkspaceDay,
  WorkspaceDragData,
  WorkspaceEmployee,
  WorkspaceEmployeeGroup,
  WorkspaceLocation,
  WorkspaceShift,
  WorkspaceZone,
}
