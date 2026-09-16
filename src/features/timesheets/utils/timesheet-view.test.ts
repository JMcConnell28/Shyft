import { describe, expect, it } from "vitest"

import type { ManagerTimesheetEmployee } from "@/features/timesheets/types"
import {
  filterTeamTimesheetEmployees,
  formatTimesheetDelta,
  formatTimesheetDuration,
  getTimesheetHealth,
} from "@/features/timesheets/utils/timesheet-view"

const READY_EMPLOYEE = createEmployee({
  employeeId: "employee-1",
  employeeName: "Jack McConnell",
  locations: ["Main Bar"],
})

describe("timesheet view utilities", () => {
  it("formats durations and signed deltas for compact metrics", () => {
    expect(formatTimesheetDuration(2490)).toBe("41h 30m")
    expect(formatTimesheetDelta(90)).toBe("+1h 30m")
    expect(formatTimesheetDelta(-20)).toBe("\u22120h 20m")
    expect(formatTimesheetDelta(0)).toBe("\u2014")
  })

  it("prioritizes review records over open records", () => {
    expect(getTimesheetHealth(READY_EMPLOYEE)).toBe("ready")
    expect(
      getTimesheetHealth({
        ...READY_EMPLOYEE,
        openEntryCount: 1,
      })
    ).toBe("open")
    expect(
      getTimesheetHealth({
        ...READY_EMPLOYEE,
        openEntryCount: 1,
        reviewCount: 1,
      })
    ).toBe("attention")
  })

  it("filters the manager list by employee, location, and status", () => {
    const attentionEmployee = createEmployee({
      employeeId: "employee-2",
      employeeName: "Sarah Riley",
      locations: ["Beer Garden"],
      reviewCount: 1,
    })
    const employees = [READY_EMPLOYEE, attentionEmployee]

    expect(
      filterTeamTimesheetEmployees(employees, {
        location: "all",
        search: "sarah",
        status: "all",
      })
    ).toEqual([attentionEmployee])
    expect(
      filterTeamTimesheetEmployees(employees, {
        location: "Beer Garden",
        search: "",
        status: "attention",
      })
    ).toEqual([attentionEmployee])
  })
})

function createEmployee(
  overrides: Pick<
    ManagerTimesheetEmployee,
    "employeeId" | "employeeName" | "locations"
  > &
    Partial<ManagerTimesheetEmployee>
): ManagerTimesheetEmployee {
  return {
    actualMinutes: 0,
    days: [],
    openEntryCount: 0,
    payableMinutes: 0,
    reviewCount: 0,
    scheduledMinutes: 0,
    ...overrides,
  }
}
