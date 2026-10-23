import { createDemoEmployees } from "./create-demo-employees"
import { demoRotaBoardData } from "./demo-rota-board"
import type { WorkspaceBoardData } from "@/features/rota/types/workspace"
import {
  DEMO_DEFAULT_EMPLOYEE_COUNT,
  demoZones,
} from "@/features/rota-demo/constants/demo-settings"

const zoneIds: Record<string, string> = {
  floor: "front",
  bar: "beer-garden",
  kitchen: "front",
  events: "function",
}

export const standaloneDemoBoard: WorkspaceBoardData = {
  ...demoRotaBoardData,
  meta: {
    ...demoRotaBoardData.meta,
    rotaId: "standalone-demo-rota",
    budgetPence: 650000,
    note: null,
    weekStart: "2026-10-19",
    weekEnd: "2026-10-25",
    weekLabel: "19 - 25 Oct 2026",
    settings: {
      ...demoRotaBoardData.meta.settings,
      notifyStaffOnPublish: false,
      timeFormat: "24h",
    },
  },
  days: demoRotaBoardData.days.map((day, index) => ({
    ...day,
    isoDate: `2026-10-${19 + index}`,
    dayNumber: String(19 + index),
    monthLabel: "Oct",
  })),
  employees: createDemoEmployees(DEMO_DEFAULT_EMPLOYEE_COUNT),
  zones: demoZones,
  shifts: demoRotaBoardData.shifts.map((shift) => ({
    ...shift,
    zoneId: zoneIds[shift.zoneId],
  })),
  templates: [],
}
