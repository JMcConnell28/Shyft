import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { managerClockOverride } from "./manager-clock-override"

const mock = vi.hoisted(() => ({
  insert: vi.fn(),
  update: vi.fn(),
  event: vi.fn(),
  open: vi.fn(),
  match: vi.fn(),
  authorize: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./queries", () => ({
  listOpenEntries: mock.open,
  getMatchedPublishedShift: mock.match,
}))
vi.mock("./manager-clock-data", () => ({
  assertNoLaterClockEntry: vi.fn(),
  getEmployeeForOverride: () => Promise.resolve({ id: "employee" }),
  insertTimeEntry: mock.insert,
  updateTimeEntryForClockOut: mock.update,
  insertClockEvent: mock.event,
}))
vi.mock("./shared", () => ({
  requireClockManagerScope: mock.authorize,
  ensureLocationInScope: () =>
    Promise.resolve({ id: "location", organizationId: "org" }),
}))
vi.mock("./shift-segments", () => ({
  ensureShiftSegmentCanStart: vi.fn(),
  getScheduledWindow: () => null,
}))
vi.mock("./clock-settings", () => ({
  getLocationClockSettings: () =>
    Promise.resolve({ rules: {}, timeZone: "Europe/London" }),
}))
vi.mock("@/features/billing/server/entitlements", () => ({
  requireTimeAttendanceAccess: vi.fn(),
}))

const input = {
  userId: "manager",
  employeeId: "employee",
  locationId: "location",
  reason: "Clock station was unavailable.",
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-10-18T10:00:00Z"))
  mock.authorize.mockResolvedValue({ userId: "manager" })
})
afterEach(() => {
  vi.resetAllMocks()
  vi.useRealTimers()
})

describe("backdated manager clock actions", () => {
  it("matches and records the earlier clock-in, retaining the authenticated manager", async () => {
    mock.open.mockResolvedValue([])
    mock.match.mockResolvedValue(null)
    mock.insert.mockResolvedValue({ id: "entry" })
    const occurredAt = "2026-10-18T08:00:00Z"
    await managerClockOverride({ ...input, action: "clock_in", occurredAt })
    expect(mock.match).toHaveBeenCalledWith(
      expect.objectContaining({ now: new Date(occurredAt) })
    )
    expect(mock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        occurredAt: new Date(occurredAt),
        payableStartAt: new Date(occurredAt),
        performedByUserId: "manager",
      })
    )
    expect(mock.event).toHaveBeenCalledWith(
      expect.objectContaining({
        occurredAt: new Date(occurredAt),
        eventType: "manager_clock_in",
        performedByUserId: "manager",
      })
    )
  })
  it("uses the selected clock-out rather than the time of submission", async () => {
    mock.open.mockResolvedValue([
      {
        id: "entry",
        clocked_in_at: "2026-10-18T07:00:00Z",
        status: "open",
        notes: "Original note",
      },
    ])
    mock.update.mockResolvedValue({ id: "entry" })
    const occurredAt = "2026-10-18T09:00:00Z"
    await managerClockOverride({ ...input, action: "clock_out", occurredAt })
    expect(mock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        occurredAt: new Date(occurredAt),
        payableEndAt: new Date(occurredAt),
      })
    )
    expect(mock.event).toHaveBeenCalledWith(
      expect.objectContaining({
        occurredAt: new Date(occurredAt),
        eventType: "manager_clock_out",
      })
    )
  })
  it("rejects a clock-out before the original clock-in", async () => {
    mock.open.mockResolvedValue([
      { id: "entry", clocked_in_at: "2026-10-18T08:00:00Z" },
    ])
    await expect(
      managerClockOverride({
        ...input,
        action: "clock_out",
        occurredAt: "2026-10-18T07:00:00Z",
      })
    ).rejects.toThrow("at or after")
    expect(mock.update).not.toHaveBeenCalled()
  })
  it("does not allow backdating to bypass manager permissions", async () => {
    mock.authorize.mockRejectedValue(new Error("Permission denied"))
    await expect(
      managerClockOverride({
        ...input,
        action: "clock_in",
        occurredAt: "2026-10-18T08:00:00Z",
      })
    ).rejects.toThrow("Permission denied")
    expect(mock.insert).not.toHaveBeenCalled()
  })
})
