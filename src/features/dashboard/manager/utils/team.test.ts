import { describe, expect, it } from "vitest"
import {
  dashboardAttendance,
  dashboardLocation,
  dashboardSchedule,
} from "../test-fixtures"
import { buildDashboardTeam, getTeamSummary } from "./team"

const base = {
  location: dashboardLocation,
  now: new Date("2026-10-16T10:00:00Z"),
  isToday: true,
}
describe("manager staffing and recorded attendance", () => {
  it("keeps multiple clock entries and unscheduled staff while counting people once", () => {
    const team = buildDashboardTeam({
      ...base,
      schedule: [dashboardSchedule],
      attendance: [
        { ...dashboardAttendance, clocked_out_at: "2026-10-16T09:00:00Z" },
        {
          ...dashboardAttendance,
          id: "entry-2",
          clocked_in_at: "2026-10-16T09:15:00Z",
        },
        {
          ...dashboardAttendance,
          id: "entry-3",
          employee_id: "unscheduled",
          rota_published_shift_id: null,
        },
      ],
    })
    expect(team).toHaveLength(3)
    expect(getTeamSummary(team)).toEqual({
      scheduled: 1,
      working: 2,
      recorded: 2,
    })
    expect(team.find((row) => row.employeeId === "unscheduled")?.zone).toBe(
      "Bar"
    )
  })
  it("does not describe historical open records as currently working", () => {
    const team = buildDashboardTeam({
      ...base,
      isToday: false,
      schedule: [dashboardSchedule],
      attendance: [dashboardAttendance],
    })
    expect(team[0].status).toBe("clock_out_missing")
    expect(getTeamSummary(team).working).toBe(0)
  })
  it("applies the configured grace period and never invents an absence", () => {
    const team = (now: string) =>
      buildDashboardTeam({
        ...base,
        now: new Date(now),
        schedule: [dashboardSchedule],
        attendance: [],
      })
    expect(team("2026-10-16T08:05:00Z")[0].status).toBe("upcoming")
    expect(team("2026-10-16T08:05:01Z")[0].status).toBe("arrival_due")
  })
  it("uses actual late arrivals without replacing the working status", () => {
    const team = buildDashboardTeam({
      ...base,
      schedule: [dashboardSchedule],
      attendance: [
        { ...dashboardAttendance, clocked_in_at: "2026-10-16T08:20:00Z" },
      ],
    })
    expect(team[0]).toMatchObject({ status: "working", lateMinutes: 20 })
  })
  it("flags an actual arrival one second beyond the grace period", () => {
    const team = buildDashboardTeam({
      ...base,
      schedule: [dashboardSchedule],
      attendance: [
        { ...dashboardAttendance, clocked_in_at: "2026-10-16T08:05:01Z" },
      ],
    })
    expect(team[0].lateMinutes).toBe(6)
  })
  it("treats unmatched attendance overlapping a shift as a recorded arrival", () => {
    const team = buildDashboardTeam({
      ...base,
      schedule: [dashboardSchedule],
      attendance: [{ ...dashboardAttendance, rota_published_shift_id: null }],
    })
    expect(team).toHaveLength(1)
    expect(team[0].status).toBe("working")
  })
  it("uses scheduling-only statuses without Time & Attendance", () => {
    const team = buildDashboardTeam({
      ...base,
      location: { ...dashboardLocation, attendanceEnabled: false },
      schedule: [dashboardSchedule],
      attendance: [],
    })
    expect(team[0].status).toBe("scheduled")
    expect(getTeamSummary(team).working).toBe(0)
  })
  it("retains a reviewed arrival as reviewed rather than pretending the person clocked in", () => {
    const team = buildDashboardTeam({
      ...base,
      schedule: [
        {
          ...dashboardSchedule,
          resolution_reason: "Confirmed cancelled shift.",
        },
      ],
      attendance: [],
    })
    expect(team[0]).toMatchObject({ status: "reviewed", clockedInAt: null })
  })
})
