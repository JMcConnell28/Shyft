import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { isWorkspaceBillingBlocked } from "@/features/billing/utils/billing-access"

const trial: WorkspaceTrial = {
  scope: "location",
  organizationId: null,
  locationId: "location-1",
  status: "trialing",
  trialStartedAt: "2026-09-01T00:00:00.000Z",
  trialEndsAt: "2026-09-20T00:00:00.000Z",
}

function billing(
  overrides: Partial<WorkspaceBillingState> = {}
): WorkspaceBillingState {
  return {
    billingAccountId: "account-1",
    stripeCustomerId: null,
    stripePaymentMethodId: null,
    paymentMethodSavedAt: null,
    subscriptionStatus: null,
    pastDueStartedAt: null,
    pastDueGraceEndsAt: null,
    isPastDueGraceActive: false,
    locationQuantity: 1,
    usedEmployeeQuantity: 0,
    includedEmployeeQuantity: 0,
    extraEmployeeQuantity: 0,
    timeAttendanceQuantity: 0,
    locations: [],
    hasActiveSubscription: false,
    hasSavedPaymentMethod: false,
    ...overrides,
  }
}

describe("workspace billing recovery", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-22T12:00:00.000Z"))
  })
  afterEach(() => vi.useRealTimers())

  it("blocks expired trials even when a payment method is saved", () => {
    expect(
      isWorkspaceBillingBlocked({
        trial,
        billing: billing({ hasSavedPaymentMethod: true }),
      })
    ).toBe(true)
  })

  it("keeps active subscriptions writable after the trial", () => {
    expect(
      isWorkspaceBillingBlocked({
        trial,
        billing: billing({
          subscriptionStatus: "active",
          hasActiveSubscription: true,
        }),
      })
    ).toBe(false)
  })

  it("recomputes past-due grace against current time", () => {
    const state = billing({
      subscriptionStatus: "past_due",
      isPastDueGraceActive: true,
      pastDueGraceEndsAt: "2026-09-23T00:00:00.000Z",
    })
    expect(isWorkspaceBillingBlocked({ trial, billing: state })).toBe(false)

    vi.setSystemTime(new Date("2026-09-23T00:00:01.000Z"))
    expect(isWorkspaceBillingBlocked({ trial, billing: state })).toBe(true)
  })

  it("blocks failed payments even if a trial date is still in the future", () => {
    const currentTrial = {
      ...trial,
      trialEndsAt: "2026-10-01T00:00:00.000Z",
    }
    expect(
      isWorkspaceBillingBlocked({
        trial: currentTrial,
        billing: billing({ subscriptionStatus: "unpaid" }),
      })
    ).toBe(true)
  })
})
