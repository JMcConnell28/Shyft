import { beforeEach, expect, it, vi } from "vitest"
import {
  cancelWorkspaceRenewal,
  settleWorkspaceBillingForRemoval,
} from "./workspace-closure-billing"

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  checkoutList: vi.fn(),
  checkoutExpire: vi.fn(),
  subscriptionList: vi.fn(),
  subscriptionUpdate: vi.fn(),
  customerUpdate: vi.fn(),
  sync: vi.fn(),
  finalize: vi.fn(),
  submit: vi.fn(),
}))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query: mocks.query }) }))
vi.mock("@/features/billing/server/stripe", () => ({
  getStripe: () => ({
    subscriptions: {
      list: mocks.subscriptionList,
      update: mocks.subscriptionUpdate,
    },
    customers: { update: mocks.customerUpdate },
    checkout: {
      sessions: { list: mocks.checkoutList, expire: mocks.checkoutExpire },
    },
  }),
}))
vi.mock("@/features/billing/server/subscriptions", () => ({
  openSubscriptionStatuses: new Set(["active", "trialing", "past_due"]),
  upsertStripeSubscription: mocks.sync,
}))
vi.mock("@/features/billing/server/usage", () => ({
  finalizeEndedBillingPeriods: mocks.finalize,
  submitEmployeeOverageMeter: mocks.submit,
}))

const activeSubscription = {
  id: "sub-1",
  status: "active",
  cancel_at: null,
  cancel_at_period_end: false,
  items: { data: [{ current_period_end: 2_000_000_000 }] },
}
const scheduledSubscription = {
  ...activeSubscription,
  cancel_at_period_end: true,
}
const assertHeld = () => {}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.query.mockResolvedValue({
    rows: [{ account_id: "acct-1", customer_id: "cus-1" }],
  })
  mocks.checkoutList.mockReturnValue([
    { id: "setup-session", mode: "setup" },
    { id: "station-session", mode: "payment" },
  ])
  mocks.subscriptionList.mockReturnValue([activeSubscription])
  mocks.subscriptionUpdate.mockResolvedValue(scheduledSubscription)
})

it("turns off renewal while retaining the paid period and expires old subscription checkouts", async () => {
  await expect(cancelWorkspaceRenewal("org-1", assertHeld)).resolves.toEqual({
    endsAt: new Date(2_000_000_000_000).toISOString(),
  })
  expect(mocks.query).toHaveBeenCalledWith(expect.any(String), ["org-1"])
  expect(mocks.checkoutExpire.mock.calls).toEqual([["setup-session"]])
  expect(mocks.subscriptionUpdate).toHaveBeenCalledWith("sub-1", {
    cancel_at_period_end: true,
  })
  expect(mocks.sync).toHaveBeenCalledWith(scheduledSubscription)
})

it("reuses the confirmed cancellation date when the owner retries", async () => {
  mocks.subscriptionList.mockReturnValue([scheduledSubscription])
  await expect(cancelWorkspaceRenewal("org-1", assertHeld)).resolves.toEqual({
    endsAt: new Date(2_000_000_000_000).toISOString(),
  })
  expect(mocks.subscriptionUpdate).not.toHaveBeenCalled()
})

it("blocks removal until the cancellation takes effect in Stripe", async () => {
  mocks.subscriptionList.mockReturnValue([scheduledSubscription])
  await expect(
    settleWorkspaceBillingForRemoval("org-1", assertHeld)
  ).rejects.toThrow("wait for it to end")
  expect(mocks.finalize).not.toHaveBeenCalled()
  expect(mocks.checkoutExpire.mock.invocationCallOrder[0]).toBeLessThan(
    mocks.subscriptionList.mock.invocationCallOrder[0]
  )
})

it("settles final usage after Stripe confirms there are no open subscriptions", async () => {
  mocks.subscriptionList.mockReturnValue([
    { ...activeSubscription, status: "canceled" },
  ])
  await settleWorkspaceBillingForRemoval("org-1", assertHeld)
  expect(mocks.finalize).toHaveBeenCalledWith("acct-1")
  expect(mocks.submit).toHaveBeenCalledWith("acct-1")
})
