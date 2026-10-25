import { beforeEach, describe, expect, it, vi } from "vitest"
import { submitEmployeeClock } from "./actions"

const { page, gate, rpc } = vi.hoisted(() => ({
  page: vi.fn(),
  gate: vi.fn(),
  rpc: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./manager-clock-override", () => ({ managerClockOverride: vi.fn() }))
vi.mock("./queries", () => ({ getEmployeeClockPageData: page }))
vi.mock("./clock-settings", () => ({
  getLocationClockSettings: () => Promise.resolve({ rules: {} }),
}))
vi.mock("@/features/feature-flags/server/evaluation", () => ({
  requireLocationFeature: gate,
}))
vi.mock("@/features/onboarding/server/session", () => ({
  requireVerifiedSessionOrThrow: () =>
    Promise.resolve({ session: { user: { id: "user" } } }),
}))
vi.mock("@/features/billing/server/entitlements", () => ({
  requireTimeAttendanceAccess: () => Promise.resolve(),
}))
vi.mock("@/lib/supabase.server", () => ({
  createSupabaseServerClient: () => ({ rpc }),
}))
vi.mock("./shared", () => ({
  assertCurrentUser: vi.fn(),
  getRequestAuditFields: () => ({}),
  ensureLocationInScope: vi.fn(),
  requireClockManagerScope: vi.fn(),
}))
vi.mock("@/features/time-clock/utils/pay-rules", () => ({
  getPayableClockOut: () => ({ payableEndAt: new Date(), reviewReason: null }),
  getPayableClockIn: vi.fn(),
}))
beforeEach(() => {
  vi.clearAllMocks()
  gate.mockRejectedValue(new Error("New clock-ins unavailable"))
  rpc.mockResolvedValue({ data: { id: "entry" }, error: null })
})
describe("clock-in feature boundary", () => {
  it("blocks a direct clock-in action before recording attendance", async () => {
    page.mockResolvedValue({
      location: { id: "location" },
      employee: { id: "employee" },
      nextAction: "clock_in",
      isClockingEnabled: true,
      openEntry: null,
    })
    await expect(
      submitEmployeeClock({
        scanSessionId: "scan",
        userId: "user",
        action: "clock_in",
      })
    ).rejects.toThrow("New clock-ins unavailable")
    expect(gate).toHaveBeenCalledWith("time_clock.clock_in", "location")
    expect(rpc).not.toHaveBeenCalled()
  })
  it("allows an already-clocked-in employee to clock out while the flag is off", async () => {
    page.mockResolvedValue({
      location: { id: "location" },
      employee: { id: "employee" },
      nextAction: "clock_out",
      isClockingEnabled: true,
      openEntry: { id: "entry", status: "open", shiftSegment: "full" },
    })
    await expect(
      submitEmployeeClock({
        scanSessionId: "scan",
        userId: "user",
        action: "clock_out",
      })
    ).resolves.toBeTruthy()
    expect(gate).not.toHaveBeenCalled()
    expect(rpc).toHaveBeenCalledWith(
      "record_employee_clock_from_scan",
      expect.objectContaining({ p_action: "clock_out" })
    )
  })
})
