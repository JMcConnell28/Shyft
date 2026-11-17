import { beforeEach, expect, it, vi } from "vitest"

import { upsertStripeCheckoutSession } from "./checkout-sync"

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  retrieveCustomer: vi.fn(),
  retrieveSetup: vi.fn(),
}))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query: mocks.query }) }))
vi.mock("@/features/billing/server/workspace-billing-lock", () => ({
  withWorkspaceBillingLock: (
    _organizationId: string,
    operation: (assertHeld: () => void) => Promise<void>
  ) => operation(() => {}),
}))
vi.mock("@/features/billing/server/stripe", () => ({
  getStripe: () => ({
    customers: { retrieve: mocks.retrieveCustomer },
    setupIntents: { retrieve: mocks.retrieveSetup },
  }),
}))

const session: Parameters<typeof upsertStripeCheckoutSession>[0] = {
  id: "cs_setup",
  mode: "setup",
  status: "complete",
  created: 1_000,
  customer: "cus_1",
  setup_intent: "seti_1",
  metadata: { billingAccountId: "account-1", organizationId: "org-1" },
  subscription: null,
  client_reference_id: "account-1",
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.query.mockResolvedValue({ rows: [] })
})

it("ignores a completed setup event once its organisation is gone", async () => {
  await upsertStripeCheckoutSession(session)
  expect(mocks.retrieveCustomer).not.toHaveBeenCalled()
  expect(mocks.retrieveSetup).not.toHaveBeenCalled()
})

it("ignores a setup session created before the owner turned off renewal", async () => {
  mocks.query
    .mockResolvedValueOnce({ rows: [{ organization_id: "org-1" }] })
    .mockResolvedValueOnce({ rows: [{ organization_id: "org-1" }] })
  mocks.retrieveCustomer.mockResolvedValue({
    metadata: { rocketRotaRenewalCanceledAt: "1001" },
  })
  await upsertStripeCheckoutSession(session)
  expect(mocks.retrieveCustomer).toHaveBeenCalledWith("cus_1")
  expect(mocks.retrieveSetup).not.toHaveBeenCalled()
})
