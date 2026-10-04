import { describe, expect, it } from "vitest"
import { assignmentBoard } from "@/features/rota/test/shift-assignment-fixture"
import { indexWorkspaceShifts } from "@/features/rota/utils/workspace-shift-index"

const input = {
  days: assignmentBoard.days,
  location: assignmentBoard.location,
  shiftsById: Object.fromEntries(
    assignmentBoard.shifts.map((shift) => [shift.id, shift])
  ),
}

describe("workspace zone filtering", () => {
  it("shows only the selected zone while keeping all shifts indexed for conflicts and costs", () => {
    const index = indexWorkspaceShifts({ ...input, selectedZoneId: "floor" })
    expect(index.visibleShiftIdsByDayId.monday).toEqual(["target"])
    expect(index.allShiftIdsByDayId.monday).toEqual(["target", "other"])
    expect(
      indexWorkspaceShifts({ ...input, selectedZoneId: "bar" })
        .visibleShiftIdsByDayId.monday
    ).toEqual(["other"])
  })

  it("does not expose an all-zones view or show shifts without a selection", () => {
    expect(
      indexWorkspaceShifts({ ...input, selectedZoneId: "all" })
        .visibleShiftIdsByDayId.monday
    ).toEqual([])
    expect(
      indexWorkspaceShifts({ ...input, selectedZoneId: null })
        .visibleShiftIdsByDayId.monday
    ).toEqual([])
  })
})
