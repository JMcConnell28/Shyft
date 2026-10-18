import { afterEach, describe, expect, it, vi } from "vitest"
import { updateClockSettings } from "./update-clock-settings"
import { getLocationClockSettings } from "./clock-settings"

const mocks = vi.hoisted(() => ({
  upsert: vi.fn(),
  read: vi.fn(),
  authorize: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./shared", () => ({
  requireClockSettingsScope: mocks.authorize,
  ensureLocationInScope: () =>
    Promise.resolve({ id: "location", organizationId: "org" }),
}))
vi.mock("@/features/billing/server/entitlements", () => ({
  requireTimeAttendanceAccess: vi.fn(),
}))
vi.mock("@/lib/supabase.server", () => ({
  createSupabaseServerClient: () => ({
    from: () => ({
      upsert: mocks.upsert,
      select: () => ({ eq: () => ({ maybeSingle: mocks.read }) }),
    }),
  }),
}))
afterEach(() => vi.resetAllMocks())

const settings = {
  userId: "manager",
  locationId: "location",
  isEnabled: true,
  latitude: null,
  longitude: null,
  radiusMeters: 75,
  maxAccuracyMeters: 150,
  timezone: "Europe/London",
  earlyClockInGraceMinutes: 10,
  earlyStartReviewMinutes: 15,
  lateClockInGraceMinutes: 5,
  lateClockOutGraceMinutes: 10,
  lateFinishReviewMinutes: 15,
  lateStartReviewMinutes: 15,
  forgottenClockOutAlertMinutes: 23,
  hardReviewAfterMinutes: 97,
  unscheduledClockOutAfterMinutes: 610,
  unscheduledClockOutReminderMinutes: 19,
}

describe("custom location clock settings", () => {
  it("persists the chosen values for the permitted location rather than fixed defaults", async () => {
    mocks.authorize.mockResolvedValue({ userId: "manager" })
    mocks.upsert.mockResolvedValue({ error: null })
    await expect(updateClockSettings(settings)).resolves.toEqual({
      success: true,
    })
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        location_id: "location",
        organization_id: "org",
        forgotten_clock_out_alert_minutes: 23,
        hard_review_after_minutes: 97,
        unscheduled_clock_out_after_minutes: 610,
        unscheduled_clock_out_reminder_minutes: 19,
      }),
      { onConflict: "location_id" }
    )
  })
  it("keeps the existing settings permissions", async () => {
    mocks.authorize.mockRejectedValue(new Error("Permission denied"))
    await expect(updateClockSettings(settings)).rejects.toThrow(
      "Permission denied"
    )
    expect(mocks.upsert).not.toHaveBeenCalled()
  })
  it("uses the saved scheduled reminder and cutoff when loading clock rules", async () => {
    mocks.read.mockResolvedValue({
      data: {
        forgotten_clock_out_alert_minutes: 23,
        hard_review_after_minutes: 97,
        timezone: "Europe/London",
      },
      error: null,
    })
    const result = await getLocationClockSettings("location")
    expect(result.rules).toMatchObject({
      forgottenClockOutAlertMinutes: 23,
      hardReviewAfterMinutes: 97,
    })
  })
})
