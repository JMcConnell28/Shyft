import { describe, expect, it, vi } from "vitest"
import { dashboardLocation } from "../test-fixtures"
import { listDashboardAttendance } from "./day-records"

const query = vi.hoisted(() => vi.fn())
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))

describe("attendance data gating", () => {
  it("does not query clock data for a location without Time & Attendance", async () => {
    expect(
      await listDashboardAttendance(
        "org",
        { ...dashboardLocation, attendanceEnabled: false },
        "2026-10-16",
        new Date()
      )
    ).toEqual([])
    expect(query).not.toHaveBeenCalled()
  })
})
