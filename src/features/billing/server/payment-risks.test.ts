import { beforeEach, describe, expect, it, vi } from "vitest"

import { recordPaymentRisk } from "./payment-risks"
import type { PaymentRiskEvent } from "./payment-risk-references"

const { charge, payments, invoice, query, sync } = vi.hoisted(() => ({
  charge: vi.fn(),
  payments: vi.fn(),
  invoice: vi.fn(),
  query: vi.fn(),
  sync: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("./stripe", () => ({
  getStripe: () => ({
    charges: { retrieve: charge },
    invoicePayments: { list: payments },
    invoices: { retrieve: invoice },
  }),
}))
vi.mock("./subscriptions", () => ({ upsertStripeSubscription: sync }))

const customerId = "00000000-0000-4000-8000-000000000001"
const event = (type: PaymentRiskEvent["type"]) =>
  ({
    id: "evt_risk",
    type,
    created: 1700000000,
    livemode: false,
    data: {
      object:
        type === "charge.refunded" ? { id: "ch_one" } : { charge: "ch_one" },
    },
  }) as PaymentRiskEvent
beforeEach(() => {
  vi.resetAllMocks()
  charge.mockResolvedValue({
    id: "ch_one",
    customer: "cus_one",
    payment_intent: "pi_one",
    amount: 1000,
    amount_refunded: 100,
    currency: "gbp",
    metadata: { billingAccountId: "untrusted-metadata" },
  })
  payments.mockResolvedValue({ has_more: false, data: [{ invoice: "in_one" }] })
  invoice.mockResolvedValue({
    parent: { subscription_details: { subscription: "sub_one" } },
  })
  query.mockImplementation((sql: string) =>
    Promise.resolve({
      rows: sql.startsWith("select") ? [{ id: customerId }] : [],
    })
  )
  sync.mockResolvedValue({ id: "sub_one", status: "active" })
})

describe("payment risk ownership and review policy", () => {
  it.each([
    "charge.refunded",
    "charge.dispute.created",
    "radar.early_fraud_warning.created",
  ] as const)(
    "records %s through the charge/invoice graph without canceling subscriptions",
    async (type) => {
      await recordPaymentRisk(event(type))
      expect(charge).toHaveBeenCalledWith("ch_one")
      expect(payments).toHaveBeenCalledWith(
        expect.objectContaining({
          payment: { type: "payment_intent", payment_intent: "pi_one" },
        })
      )
      expect(sync).toHaveBeenCalledWith({ id: "sub_one" })
      const insertion = query.mock.calls.find(([sql]) =>
        String(sql).includes("insert into billing_private.payment_risk_reviews")
      )
      expect(insertion?.[1]).toContain(customerId)
      expect(insertion?.[1]).toContain("sub_one")
      expect(insertion?.[1]).not.toContain("untrusted-metadata")
    }
  )
  it("keeps unmatched charges visible without using metadata to assign ownership", async () => {
    query.mockResolvedValue({ rows: [] })
    payments.mockResolvedValue({ has_more: false, data: [] })
    await recordPaymentRisk(event("charge.refunded"))
    expect(sync).not.toHaveBeenCalled()
    expect(query.mock.lastCall?.[1]).toEqual(
      expect.arrayContaining(["ch_one", null])
    )
  })
  it("records the dispatch hold even when refreshing the subscription fails", async () => {
    sync.mockRejectedValueOnce(new Error("Subscription lookup unavailable"))

    await expect(recordPaymentRisk(event("charge.refunded"))).rejects.toThrow(
      "Subscription lookup unavailable"
    )
    expect(query.mock.lastCall?.[0]).toContain("payment_risk_reviews")
    expect(query.mock.lastCall?.[1]).toContain(customerId)
  })
  it("fails before recording success if reference resolution is incomplete", async () => {
    payments.mockResolvedValue({ has_more: true, data: [] })
    await expect(recordPaymentRisk(event("charge.refunded"))).rejects.toThrow(
      "too many linked"
    )
    expect(query).not.toHaveBeenCalled()
  })
})
