import { beforeEach, describe, expect, it, vi } from "vitest"
import { resolveArrivalSchema } from "../schemas"
import { dashboardLocation, dashboardSchedule } from "../test-fixtures"
import { resolveDashboardArrival } from "./resolve-arrival"

const mock = vi.hoisted(() => ({
  access: vi.fn(),
  query: vi.fn(),
  entitlement: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./access", () => ({
  resolveManagerDashboardAccess: mock.access,
  requireDashboardLocation: (locations: Array<{ id: string }>, id: string) => {
    const location = locations.find((item) => item.id === id)
    if (!location) throw new Error("Location is not permitted")
    return location
  },
}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query: mock.query }) }))
vi.mock("@/features/billing/server/entitlements", () => ({
  requireTimeAttendanceAccess: mock.entitlement,
}))

const input = {
  organizationId: "org",
  locationId: dashboardLocation.id,
  assignmentId: dashboardSchedule.assignment_id,
  segment: "full" as const,
  scheduledStartAt: dashboardSchedule.starts_at,
  reason: "Employee confirmed the shift was cancelled.",
}
beforeEach(() => {
  vi.resetAllMocks()
  mock.access.mockResolvedValue({
    userId: "authenticated-manager",
    capabilities: { canManageTimeClock: true },
    locations: [dashboardLocation],
  })
  mock.query.mockResolvedValue({ rowCount: 1 })
})
describe("audited arrival resolution", () => {
  it.each([{ canWrite: false }, { attendanceEnabled: false }])(
    "rejects a blocked location before any write: %s",
    async (patch) => {
      mock.access.mockResolvedValue({
        userId: "manager",
        capabilities: { canManageTimeClock: true },
        locations: [{ ...dashboardLocation, ...patch }],
      })
      await expect(resolveDashboardArrival(input)).rejects.toThrow(
        "cannot resolve"
      )
      expect(mock.query).not.toHaveBeenCalled()
    }
  )
  it("checks the selected location and records the authenticated actor with the exact scheduled segment", async () => {
    await expect(
      resolveDashboardArrival({ ...input, locationId: "outside" })
    ).rejects.toThrow("not permitted")
    expect(mock.query).not.toHaveBeenCalled()
    await resolveDashboardArrival(input)
    expect(mock.entitlement).toHaveBeenCalledWith(dashboardLocation.id)
    expect(mock.query.mock.calls[0][1].slice(0, 7)).toEqual([
      "org",
      [dashboardLocation.id],
      dashboardSchedule.assignment_id,
      "full",
      dashboardSchedule.starts_at,
      input.reason,
      "authenticated-manager",
    ])
  })
  it("refuses to claim a resolution when the arrival was recorded or already reviewed concurrently", async () => {
    mock.query.mockResolvedValue({ rowCount: 0 })
    await expect(resolveDashboardArrival(input)).rejects.toThrow(
      "already reviewed"
    )
  })
  it("validates resolution reasons and identifiers at the server boundary", () => {
    expect(
      resolveArrivalSchema.safeParse({ ...input, reason: " " }).success
    ).toBe(false)
    expect(
      resolveArrivalSchema.safeParse({ ...input, scheduledStartAt: "invalid" })
        .success
    ).toBe(false)
    expect(resolveArrivalSchema.safeParse(input).success).toBe(true)
  })
})
