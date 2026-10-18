import { afterEach, describe, expect, it, vi } from "vitest"
import { processAutomaticClockOuts } from "./automatic-clock-out"

const mocks = vi.hoisted(() => ({
  close: vi.fn(),
  claim: vi.fn(),
  finish: vi.fn(),
  open: vi.fn(),
  push: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./automatic-clock-out-data", () => ({
  closeOverdueClockEntries: mocks.close,
  claimClockReminders: mocks.claim,
  finishClockReminder: mocks.finish,
  isClockReminderOpen: mocks.open,
}))
vi.mock("@/features/push-notifications/server/push-service", () => ({
  sendPushToUser: mocks.push,
}))
afterEach(() => vi.resetAllMocks())

const reminder = {
  id: "entry",
  userId: "employee",
  workspaceSlug: "team",
  scheduled: true,
  limitMinutes: 480,
}
const now = new Date("2026-10-18T16:15:00Z")
function setup() {
  mocks.close.mockResolvedValue(1)
  mocks.claim.mockResolvedValue([reminder])
  mocks.finish.mockResolvedValue(undefined)
  mocks.open.mockResolvedValue(true)
}

describe("clock-out background processing", () => {
  it("uses the location's custom maximum in unscheduled reminder text", async () => {
    setup()
    mocks.claim.mockResolvedValue([
      { ...reminder, scheduled: false, limitMinutes: 720 },
    ])
    mocks.push.mockResolvedValue({ sent: 1, failed: 0, removed: 0 })
    await processAutomaticClockOuts(now)
    expect(mocks.push).toHaveBeenCalledWith(
      "employee",
      expect.objectContaining({ body: expect.stringContaining("12 hours") })
    )
  })
  it("closes entries and targets the employee's devices with a deduplicated reminder", async () => {
    setup()
    mocks.push.mockResolvedValue({ sent: 1, failed: 0, removed: 0 })
    expect(await processAutomaticClockOuts(now)).toEqual({
      closed: 1,
      reminders: 1,
      failed: 0,
    })
    expect(mocks.push).toHaveBeenCalledWith(
      "employee",
      expect.objectContaining({
        tag: "clock-out-entry",
        data: { notificationId: "entry", url: "/app/team/dashboard" },
      })
    )
    expect(mocks.finish).toHaveBeenCalledWith("entry", now, true)
  })
  it("does not let a push failure block closure or mark a reminder delivered", async () => {
    setup()
    mocks.push.mockResolvedValue({ sent: 0, failed: 1, removed: 0 })
    expect(await processAutomaticClockOuts(now)).toEqual({
      closed: 1,
      reminders: 0,
      failed: 1,
    })
    expect(mocks.close).toHaveBeenCalledWith(now)
    expect(mocks.finish).toHaveBeenCalledWith("entry", now, false)
  })
  it("does not notify an employee who clocked out after their reminder was claimed", async () => {
    setup()
    mocks.open.mockResolvedValue(false)
    await processAutomaticClockOuts(now)
    expect(mocks.push).not.toHaveBeenCalled()
  })
  it("completes entries with no subscribed devices instead of retrying forever", async () => {
    setup()
    mocks.push.mockResolvedValue({ sent: 0, failed: 0, removed: 0 })
    await processAutomaticClockOuts(now)
    expect(mocks.finish).toHaveBeenCalledWith("entry", now, true)
  })
})
