import { beforeEach, describe, expect, it, vi } from "vitest"
import { createSubscriptionCheckoutSession } from "./checkout"
import type Stripe from "stripe"

const mocks = vi.hoisted(() => ({
  createSession: vi.fn(),
  retrieveCustomer: vi.fn(),
  ensureTrial: vi.fn(),
}))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/features/billing/server/stripe", () => ({
  getStripe: () => ({
    customers: { retrieve: mocks.retrieveCustomer },
    checkout: { sessions: { create: mocks.createSession } },
  }),
  getBillingCurrency: () => "gbp",
}))
vi.mock("@/features/billing/server/billing-accounts", () => ({
  ensureOrganizationBillingAccount: () => ({
    id: "billing-account",
    stripe_customer_id: "cus_without_address",
  }),
  ensureLocationBillingAccount: vi.fn(),
  setBillingAccountStripeCustomer: vi.fn(),
}))
vi.mock("@/features/billing/server/trials", () => ({
  ensureWorkspaceTrial: mocks.ensureTrial,
}))
vi.mock("@/features/billing/server/subscriptions", () => ({
  getOpenBillingSubscription: () => null,
  findOpenStripeSubscriptionForBillingAccount: () => null,
}))
vi.mock("@/features/billing/server/pricing", () => ({
  getBillingPricingQuantities: () => ({
    locationQuantity: 1,
    usedEmployeeQuantity: 5,
    includedEmployeeQuantity: 10,
    extraEmployeeQuantity: 0,
    timeAttendanceQuantity: 0,
  }),
}))
vi.mock("@/features/billing/server/subscription-items", () => ({
  buildSubscriptionLineItems: () => [{ price: "price_core", quantity: 1 }],
}))
vi.mock("@/features/billing/server/urls", () => ({
  buildAppUrl: (path: string) => `https://example.test${path}`,
  getSafeAppReturnPath: (path: string | undefined, fallback: string) =>
    path ?? fallback,
}))

const input = {
  organizationId: "organization",
  user: { id: "owner", email: "owner@example.test", name: "Owner" },
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.retrieveCustomer.mockResolvedValue({
    id: "cus_without_address",
    address: null,
  })
  mocks.createSession.mockImplementation(
    (request: Stripe.Checkout.SessionCreateParams) => {
      if (
        request.customer_update?.address !== "auto" ||
        request.billing_address_collection !== "required"
      ) {
        throw new Error("Checkout cannot save the customer's billing address.")
      }
      if (
        request.tax_id_collection?.enabled &&
        request.customer_update?.name !== "auto"
      ) {
        throw new Error("Tax ID collection requires saving the business name.")
      }
      return Promise.resolve({ url: "https://checkout.stripe.com/test-session" })
    }
  )
})

describe("Checkout for an existing customer without an address", () => {
  it("can restore an expired trial with automatic tax and tax ID collection", async () => {
    mocks.ensureTrial.mockResolvedValue({
      status: "expired",
      trialEndsAt: "2020-01-01T00:00:00Z",
    })

    await expect(createSubscriptionCheckoutSession(input)).resolves.toEqual({
      checkoutUrl: "https://checkout.stripe.com/test-session",
    })
    expect(mocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        customer: "cus_without_address",
        automatic_tax: { enabled: true },
        tax_id_collection: { enabled: true },
      })
    )
  })

  it("collects and saves an address during trial card setup for later billing", async () => {
    mocks.ensureTrial.mockResolvedValue({
      status: "trialing",
      trialEndsAt: "2099-01-01T00:00:00Z",
    })

    await expect(createSubscriptionCheckoutSession(input)).resolves.toEqual({
      checkoutUrl: "https://checkout.stripe.com/test-session",
    })
    expect(mocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "setup", customer: "cus_without_address" })
    )
  })
})
