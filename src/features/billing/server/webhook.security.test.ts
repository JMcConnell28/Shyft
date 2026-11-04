import Stripe from "stripe"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { handleStripeWebhook } from "./webhook"
import { syncCurrentStripeSubscription } from "./current-subscription"

const {
  acquire,
  received,
  processed,
  failed,
  sync,
  risk,
  holdStation,
  payment,
  email,
  release,
  retrieve,
  persist,
} = vi.hoisted(() => ({
  acquire: vi.fn(),
  received: vi.fn(),
  processed: vi.fn(),
  failed: vi.fn(),
  sync: vi.fn(),
  risk: vi.fn(),
  holdStation: vi.fn(),
  payment: vi.fn(),
  email: vi.fn(),
  release: vi.fn(),
  retrieve: vi.fn(),
  persist: vi.fn(),
}))
const stripe = new Stripe("sk_test_synthetic_offline_fixture")
const secret = "whsec_synthetic_offline_fixture"
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./stripe", () => ({
  getStripe: () => ({ webhooks: stripe.webhooks, subscriptions: { retrieve } }),
}))
vi.mock("@/lib/env.server", () => ({ getRequiredEnv: () => secret }))
vi.mock("./processing-locks", () => ({ acquireBillingProcessingLock: acquire }))
vi.mock("./webhook-events", () => ({
  recordStripeWebhookReceived: received,
  recordStripeWebhookProcessed: processed,
  recordStripeWebhookFailed: failed,
}))
vi.mock("./subscriptions", () => ({
  upsertStripeSubscription: sync,
  syncSubscriptionFromInvoice: sync,
  upsertStripeCheckoutSession: vi.fn(),
  syncStripeCustomerTaxState: vi.fn(),
}))
vi.mock("./payment-risks", () => ({ recordPaymentRisk: risk }))
vi.mock("./station-payments", () => ({ recordStationPayment: payment }))
vi.mock("./station-alerts", () => ({ sendPendingStationAlerts: vi.fn() }))
vi.mock("./email-notifications", () => ({
  sendPaymentFailedNotification: email,
}))
vi.mock("@/features/station-purchases/server/payments", () => ({
  holdRefundedStation: holdStation,
  syncStationCheckout: vi.fn(),
}))

function request(
  type = "customer.subscription.updated",
  object: Record<string, unknown> = { id: "sub_one", status: "active" }
) {
  const payload = JSON.stringify({
    id: "evt_one",
    type,
    created: 1700000000,
    livemode: false,
    data: { object },
  })
  return new Request("https://app.example/api/stripe/webhook", {
    method: "POST",
    headers: {
      "stripe-signature": stripe.webhooks.generateTestHeaderString({
        payload,
        secret,
      }),
    },
    body: payload,
  })
}
beforeEach(() => {
  vi.resetAllMocks()
  acquire.mockResolvedValue({ release, assertHeld: () => undefined })
  received.mockResolvedValue("new")
  release.mockResolvedValue(undefined)
  sync.mockResolvedValue({ id: "sub_one", status: "active" })
})

describe("signed webhook processing boundaries", () => {
  it("rejects invalid signatures before any processing claim", async () => {
    const req = request()
    req.headers.set("stripe-signature", "invalid")
    expect((await handleStripeWebhook(req)).status).toBe(400)
    expect(acquire).not.toHaveBeenCalled()
  })
  it("requests a retry while another worker holds the event, without acknowledging its work", async () => {
    acquire.mockResolvedValueOnce(null)
    expect((await handleStripeWebhook(request())).status).toBe(503)
    expect(received).not.toHaveBeenCalled()
    expect(sync).not.toHaveBeenCalled()
  })
  it("acknowledges already processed events without repeating effects", async () => {
    received.mockResolvedValueOnce("already-processed")
    expect((await handleStripeWebhook(request())).status).toBe(200)
    expect(sync).not.toHaveBeenCalled()
    expect(release).toHaveBeenCalledOnce()
  })
  it("releases a failed event for retry and does not mark it processed", async () => {
    sync.mockRejectedValueOnce(new Error("Stripe unavailable"))
    expect((await handleStripeWebhook(request())).status).toBe(500)
    expect(failed).toHaveBeenCalledOnce()
    expect(processed).not.toHaveBeenCalled()
    expect(release).toHaveBeenCalledOnce()
  })
  it.each([
    "charge.refunded",
    "charge.dispute.created",
    "radar.early_fraud_warning.created",
  ])("records operator review for %s", async (type) => {
    expect(
      (
        await handleStripeWebhook(
          request(type, { id: "ch_one", payment_intent: "pi_one" })
        )
      ).status
    ).toBe(200)
    expect(risk).toHaveBeenCalledOnce()
    expect(processed).toHaveBeenCalledOnce()
  })
  it("holds a refunded station before retrying an unavailable risk lookup", async () => {
    risk.mockRejectedValueOnce(new Error("Stripe charge lookup unavailable"))

    const response = await handleStripeWebhook(
      request("charge.refunded", { id: "ch_one", payment_intent: "pi_one" })
    )
    expect(response.status).toBe(500)
    expect(holdStation).toHaveBeenCalledWith("pi_one", "refunded")
    expect(processed).not.toHaveBeenCalled()
  })
  it("does not release hardware or send stale failure emails after a subscription is canceled", async () => {
    sync.mockResolvedValue({ id: "sub_one", status: "canceled" })
    expect(
      (await handleStripeWebhook(request("invoice.paid", { id: "in_one" })))
        .status
    ).toBe(200)
    expect(payment).not.toHaveBeenCalled()
    expect(
      (
        await handleStripeWebhook(
          request("invoice.payment_failed", { id: "in_two" })
        )
      ).status
    ).toBe(200)
    expect(email).not.toHaveBeenCalled()
  })
  it("keeps cancellation when a signed older active payload arrives afterward", async () => {
    retrieve.mockResolvedValue({ id: "sub_one", status: "canceled" })
    persist.mockResolvedValue(undefined)
    sync.mockImplementation((input: { id: string }) =>
      syncCurrentStripeSubscription(input.id, persist)
    )
    expect(
      (
        await handleStripeWebhook(
          request("customer.subscription.deleted", {
            id: "sub_one",
            status: "canceled",
          })
        )
      ).status
    ).toBe(200)
    expect(
      (
        await handleStripeWebhook(
          request("customer.subscription.updated", {
            id: "sub_one",
            status: "active",
          })
        )
      ).status
    ).toBe(200)
    expect(persist).toHaveBeenCalledTimes(2)
    expect(
      persist.mock.calls.every(([value]) => value.status === "canceled")
    ).toBe(true)
  })
  it("does not acknowledge a concurrent duplicate until the first delivery completes", async () => {
    let busy = false
    let finish: () => void = () => undefined
    acquire.mockImplementation(() => {
      if (busy) return Promise.resolve(null)
      busy = true
      return Promise.resolve({
        assertHeld: () => undefined,
        release: () => {
          busy = false
          return Promise.resolve()
        },
      })
    })
    sync.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = () => resolve({ id: "sub_one", status: "active" })
        })
    )
    const first = handleStripeWebhook(request())
    await vi.waitFor(() => expect(sync).toHaveBeenCalledOnce())
    expect((await handleStripeWebhook(request())).status).toBe(503)
    finish()
    expect((await first).status).toBe(200)
    expect(sync).toHaveBeenCalledOnce()
  })
})
