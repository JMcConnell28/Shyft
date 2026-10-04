import type {
  WorkspaceBoardData,
  WorkspaceEmployee,
  WorkspaceStandardShift,
} from "@/features/rota/types/workspace"
import { demoRotaBoardData } from "@/features/rota-demo/data/demo-rota-board"

const targetShift: WorkspaceStandardShift = {
  id: "target",
  dayId: "monday",
  zoneId: "floor",
  shiftType: "standard",
  startTime: "09:00",
  endTime: "15:00",
}

function employee(id: string, name: string): WorkspaceEmployee {
  return {
    id,
    name,
    groupId: "front-of-house",
    groupColor: "sky",
    weeklyHours: 40,
    compensation: { type: "hourly", hourlyRatePence: 1500 },
  }
}

const assignmentBoard: WorkspaceBoardData = {
  ...demoRotaBoardData,
  employees: [
    employee("ava", "Ava"),
    employee("ella", "Ella"),
    employee("leo", "Leo"),
    employee("remy", "Remy"),
  ],
  shifts: [
    targetShift,
    {
      ...targetShift,
      id: "other",
      zoneId: "bar",
      startTime: "14:00",
      endTime: "18:00",
    },
  ],
  assignments: [
    { id: "assigned", employeeId: "ava", shiftId: "target" },
    { id: "overlap", employeeId: "ella", shiftId: "other" },
  ],
}

export { assignmentBoard, targetShift }
