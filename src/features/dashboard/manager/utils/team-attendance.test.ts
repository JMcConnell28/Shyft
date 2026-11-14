import { describe, expect, it } from "vitest"
import {
  dashboardAttendance,
  dashboardLocation,
  dashboardSchedule,
} from "../test-fixtures"
import { buildDashboardTeam } from "./team"
import {
  getDashboardTimesheetSearch,
  getTeamClockActions,
  getTeamTimeEntry,
} from "./team-attendance"
import type { ManagerClockEmployee } from "@/features/time-clock/types"

const staffing = {
  location: dashboardLocation,
  now: new Date("2026-10-16T10:00:00Z"),
  isToday: true,
  schedule: [dashboardSchedule],
}
const [scheduled] = buildDashboardTeam({ ...staffing, attendance: [] })
const [working] = buildDashboardTeam({
  ...staffing,
  attendance: [dashboardAttendance],
})
const employee: ManagerClockEmployee = {
  id: working.employeeId,
  name: working.employeeName,
  locationId: dashboardLocation.id,
  locationName: dashboardLocation.name,
  email: null,
  isActive: true,
  openEntry: null,
}
const clockedIn: ManagerClockEmployee = {
  ...employee,
  openEntry: {
    id: dashboardAttendance.id,
    clockedInAt: dashboardAttendance.clocked_in_at,
    scheduledEndAt: dashboardAttendance.scheduled_end_at,
    status: "open",
    source: dashboardAttendance.source,
    isForgottenClockOutAlert: false,
  },
}

describe("staffing clock actions", () => {
  it("enables clock-in for a scheduled row without an open entry", () => {
    expect(
      getTeamClockActions({
        ...staffing,
        row: scheduled,
        clockEmployee: employee,
      })
    ).toMatchObject({ canClockIn: true, canClockOut: false })
  })

  it("offers clock-out only on the matching open entry, even with several rows for the employee", () => {
    expect(
      getTeamClockActions({
        ...staffing,
        row: working,
        clockEmployee: clockedIn,
      })
    ).toMatchObject({ canClockIn: false, canClockOut: true })
    expect(
      getTeamClockActions({
        ...staffing,
        row: scheduled,
        clockEmployee: clockedIn,
      })
    ).toMatchObject({ canClockIn: false, canClockOut: false })
  })

  it("does not offer manual clock actions for history, read-only locations, or missing clock state", () => {
    const input = { ...staffing, row: working, clockEmployee: clockedIn }
    expect(getTeamClockActions({ ...input, isToday: false })).toBeNull()
    expect(
      getTeamClockActions({
        ...input,
        location: { ...dashboardLocation, canWrite: false },
      })
    ).toBeNull()
    expect(
      getTeamClockActions({ ...input, clockEmployee: undefined })
    ).toBeNull()
  })

  it("links an unmatched overnight entry to the entry's week rather than the displayed shift's week", () => {
    const [row] = buildDashboardTeam({
      ...staffing,
      now: new Date("2026-10-19T02:00:00Z"),
      schedule: [
        {
          ...dashboardSchedule,
          day_date: "2026-10-18",
          starts_at: "2026-10-18T21:00:00Z",
          ends_at: "2026-10-19T03:00:00Z",
        },
      ],
      attendance: [
        {
          ...dashboardAttendance,
          rota_published_shift_id: null,
          clocked_in_at: "2026-10-18T23:30:00Z",
          work_date: "2026-10-19",
        },
      ],
    })
    const timeEntry = getTeamTimeEntry(row, dashboardLocation)
    expect(row.assignmentId).toBe(dashboardSchedule.assignment_id)
    expect(timeEntry && getDashboardTimesheetSearch(timeEntry)).toEqual({
      entryId: dashboardAttendance.id,
      weekStart: "2026-10-19",
    })
  })
})
