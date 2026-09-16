import { describe, expect, it } from "vitest"

import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { getBillingStatus } from "@/features/billing/utils/billing-settings"

const billingBase: WorkspaceBillingState = {
  billingAccountId: "billing-1",
  extraEmployeeQuantity: 0,
  hasActiveSubscription: false,
  hasSavedPaymentMethod: false,
  includedEmployeeQuantity: 10,
  isPastDueGraceActive: false,
  locationQuantity: 1,
  locations: [],
  pastDueGraceEndsAt: null,
  pastDueStartedAt: null,
  paymentMethodSavedAt: null,
  stripeCustomerId: null,
  stripePaymentMethodId: null,
  subscriptionStatus: null,
  timeAttendanceQuantity: 0,
  usedEmployeeQuantity: 0,
}

const expiredTrial: WorkspaceTrial = {
  locationId: null,
  organizationId: "org-1",
  scope: "organization",
  status: "expired",
  trialEndsAt: "2026-01-01T00:00:00.000Z",
  trialStartedAt: "2025-12-18T00:00:00.000Z",
}

describe("getBillingStatus", () => {
  it("shows active subscriptions as positive", () => {
    const status = getBillingStatus({
      billing: {
        ...billingBase,
        hasActiveSubscription: true,
        subscriptionStatus: "active",
      },
      trial: null,
    })

    expect(status).toMatchObject({ label: "Active", tone: "positive" })
  })

  it("prioritises past-due recovery messaging", () => {
    const status = getBillingStatus({
      billing: {
        ...billingBase,
        isPastDueGraceActive: true,
        subscriptionStatus: "past_due",
      },
      trial: null,
    })

    expect(status).toMatchObject({ label: "Past due", tone: "danger" })
    expect(status.description).toContain("grace period")
  })

  it("marks an expired trial as requiring action", () => {
    const status = getBillingStatus({
      billing: billingBase,
      trial: expiredTrial,
    })

    expect(status).toMatchObject({ label: "Expired", tone: "danger" })
  })
})
