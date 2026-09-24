import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getLocationEntitlement } from "@/features/billing/server/entitlements"

const query = vi.hoisted(() => vi.fn())

vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))

function entitlementRow(subscriptionStatus: string | null) {
  return {
    location_id: "00000000-0000-0000-0000-000000000001",
    billing_account_id: "00000000-0000-0000-0000-000000000002",
    trial_ends_at: "2026-10-01T00:00:00.000Z",
    subscription_status: subscriptionStatus,
    current_period_end: null,
    past_due_started_at: "2026-09-01T00:00:00.000Z",
    addon_status: "active",
    addon_billing_starts_at: null,
    addon_cancel_at: null,
    legacy_opt_in_deadline: null,
    transfer_id: null,
    source_billing_account_id: null,
    target_billing_account_id: null,
    transfer_status: null,
    transfer_effective_at: null,
  }
}

describe("location entitlements", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-22T12:00:00.000Z"))
    query.mockReset()
  })
  afterEach(() => vi.useRealTimers())

  it.each(["past_due", "unpaid", "incomplete_expired"])(
    "makes %s view-only even before the trial date",
    async (status) => {
      query.mockResolvedValue({ rows: [entitlementRow(status)] })
      const entitlement = await getLocationEntitlement(
        "00000000-0000-0000-0000-000000000001"
      )
      expect(entitlement.accessState).toBe("recovery")
      expect(entitlement.canWrite).toBe(false)
      expect(entitlement.timeAttendanceEnabled).toBe(false)
    }
  )

  it("keeps an unpaid-free trial writable", async () => {
    query.mockResolvedValue({ rows: [entitlementRow(null)] })
    const entitlement = await getLocationEntitlement(
      "00000000-0000-0000-0000-000000000001"
    )
    expect(entitlement.accessState).toBe("trial")
    expect(entitlement.canWrite).toBe(true)
  })
})
