import { describe, expect, it } from "vitest"

import type { WorkspaceBoardData } from "@/features/rota/types/workspace"
import { DEFAULT_ROTA_SETTINGS } from "@/features/rota/constants/rota-settings"
import { buildPublishedRotaBoardIndex } from "@/features/rota/utils/published-rota-board"

const board: WorkspaceBoardData = {
  meta: {
    rotaId: "rota",
    status: "published",
    canManage: false,
    canEdit: false,
    organizationId: "org",
    userId: "user",
    workspaceType: "organization",
    note: null,
    weekStart: "2026-09-28",
    weekEnd: "2026-10-04",
    weekLabel: "28 Sep – 4 Oct",
    contentVersion: 1,
    publishedContentVersion: 1,
    publishedVersion: 1,
    hasUnpublishedChanges: false,
    publishedSnapshotAvailable: true,
    budgetPence: null,
    settings: DEFAULT_ROTA_SETTINGS,
  },
  location: {
    id: "location",
    name: "Cafe",
    closeTimeByDayId: {},
    closeTimeNextDayByDayId: {},
    estimatedCloseTime: "23:00",
    estimatedCloseTimeNextDay: false,
  },
  days: [
    {
      id: "monday",
      isoDate: "2026-09-28",
      shortLabel: "Mon",
      dayNumber: "28",
      monthLabel: "Sep",
    },
  ],
  zones: [
    { id: "bar", name: "Bar" },
    { id: "floor", name: "Floor" },
  ],
  employeeGroups: [],
  employees: [
    {
      id: "employee",
      name: "Alex",
      groupId: "group",
      groupColor: "slate",
      weeklyHours: 0,
      compensation: { type: "hourly", hourlyRatePence: 1200 },
    },
  ],
  shifts: [
    {
      id: "late",
      dayId: "monday",
      zoneId: "bar",
      shiftType: "standard",
      startTime: "17:00",
      endTime: "22:00",
    },
    {
      id: "other-zone",
      dayId: "monday",
      zoneId: "floor",
      shiftType: "standard",
      startTime: "08:00",
      endTime: "12:00",
    },
    {
      id: "early",
      dayId: "monday",
      zoneId: "bar",
      shiftType: "standard",
      startTime: "09:00",
      endTime: "15:00",
    },
  ],
  assignments: [{ id: "assignment", employeeId: "employee", shiftId: "early" }],
  templates: [],
}

describe("published rota board index", () => {
  it("keeps published shifts ordered and filters only the selected zone", () => {
    expect(
      buildPublishedRotaBoardIndex(board, "all").shiftsByDayId.monday?.map(
        (shift) => shift.id
      )
    ).toEqual(["other-zone", "early", "late"])

    const filtered = buildPublishedRotaBoardIndex(board, "bar")
    expect(filtered.shiftsByDayId.monday?.map((shift) => shift.id)).toEqual([
      "early",
      "late",
    ])
    expect(filtered.assignmentsByShiftId.early).toEqual(board.assignments)
    expect(filtered.employeesById.employee?.name).toBe("Alex")
  })
})
