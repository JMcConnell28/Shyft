import { describe, expect, it } from "vitest"

import type {
  WorkspaceLocation,
  WorkspaceShift,
} from "@/features/rota/types/workspace"
import { calculateRotaSummary } from "@/features/rota/utils/rota-summary"

const closingShift: WorkspaceShift = {
  id: "closing-shift",
  dayId: "monday",
  zoneId: "bar",
  shiftType: "closing",
  startTime: "17:00",
  endKind: "locationClose",
}

function createLocation(closeTime: string): WorkspaceLocation {
  return {
    id: "location",
    name: "Location",
    closeTimeByDayId: { monday: closeTime },
    closeTimeNextDayByDayId: {},
    estimatedCloseTime: "23:00",
    estimatedCloseTimeNextDay: false,
  }
}

describe("calculateRotaSummary", () => {
  it("recalculates assigned closing shifts from the latest closing time", () => {
    const assignments = [
      { employeeId: "employee-1", shiftId: closingShift.id },
      { employeeId: "employee-2", shiftId: closingShift.id },
    ]

    expect(
      calculateRotaSummary({
        assignments,
        location: createLocation("23:00"),
        shifts: [closingShift],
      }).scheduledHours
    ).toBe(12)
    expect(
      calculateRotaSummary({
        assignments,
        location: createLocation("01:00"),
        shifts: [closingShift],
      }).scheduledHours
    ).toBe(16)
  })

  it("keeps staff and shift counts stable while refreshing hours", () => {
    expect(
      calculateRotaSummary({
        assignments: [
          { employeeId: "employee-1", shiftId: closingShift.id },
          { employeeId: "employee-2", shiftId: "missing-shift" },
        ],
        location: createLocation("00:00"),
        shifts: [closingShift],
      })
    ).toEqual({
      scheduledHours: 7,
      scheduledStaffCount: 1,
      shiftCount: 1,
    })
  })
})
