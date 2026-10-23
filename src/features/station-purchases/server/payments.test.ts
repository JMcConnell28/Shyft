import { beforeEach, describe, expect, it, vi } from "vitest"
import { matchesStationPayment, syncStationCheckout } from "./payments"
import type { StationOrder } from "./orders"
import type { StationCheckout } from "./payment-types"

const { query, lineItems, intent } = vi.hoisted(() => ({
  query: vi.fn(),
  lineItems: vi.fn(),
  intent: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("@/features/billing/server/stripe", () => ({
  getStripe: () => ({
    checkout: { sessions: { listLineItems: lineItems } },
    paymentIntents: { retrieve: intent },
  }),
}))
const order: StationOrder = {
  id: "order",
  location_id: "location",
  billing_account_id: "account",
  stripe_customer_id: "cus_1",
  stripe_price_id: "price_1",
  stripe_checkout_session_id: "cs_1",
  unit_amount: 2499,
  currency: "gbp",
  return_path: "/app/demo/settings/billing",
  created_at: new Date(),
  payment_status: "awaiting_payment",
}
const session: StationCheckout = {
  id: "cs_1",
  mode: "payment",
  metadata: {
    purpose: "extra_clock_station",
    purchaseId: "order",
    locationId: "location",
    billingAccountId: "account",
  },
  client_reference_id: "order",
  customer: "cus_1",
  currency: "gbp",
  amount_total: 2499,
  payment_status: "paid",
  payment_intent: "pi_1",
  livemode: true,
  status: "complete",
}
const items = [{ price: { id: "price_1" }, quantity: 1, amount_total: 2499 }]
beforeEach(() => {
  vi.clearAllMocks()
  query
    .mockResolvedValue({ rows: [{ id: "order" }] })
    .mockResolvedValueOnce({ rows: [order] })
  lineItems.mockResolvedValue({ data: items })
  intent.mockResolvedValue({
    status: "succeeded",
    amount_received: 2499,
    currency: "gbp",
    latest_charge: { amount_refunded: 0, disputed: false },
  })
})
describe("extra station payments", () => {
  it("requires the exact customer, order, location, price, quantity and total", () => {
    expect(matchesStationPayment(order, session, items)).toBe(true)
    for (const changed of [
      { customer: "cus_other" },
      { amount_total: 2498 },
      { client_reference_id: "other" },
      { currency: "eur" },
    ]) {
      expect(
        matchesStationPayment(order, { ...session, ...changed }, items)
      ).toBe(false)
    }
    expect(
      matchesStationPayment(order, session, [{ ...items[0], quantity: 2 }])
    ).toBe(false)
    expect(
      matchesStationPayment(order, session, [
        { ...items[0], price: { id: "another" } },
      ])
    ).toBe(false)
  })
  it("does not fulfil a completed checkout that is still unpaid", async () => {
    await syncStationCheckout({ ...session, payment_status: "unpaid" })
    expect(intent).not.toHaveBeenCalled()
    expect(
      query.mock.calls.some(([sql]) => String(sql).includes("paid_at ="))
    ).toBe(false)
  })
  it("records a settled payment with a guarded, repeatable update", async () => {
    await syncStationCheckout(session)
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining(
        "payment_status in ('awaiting_payment','failed','expired')"
      ),
      ["order", "pi_1", true, "paid"]
    )
  })
  it("records test payments without making them live fulfilment requests", async () => {
    await syncStationCheckout({ ...session, livemode: false })
    expect(query).toHaveBeenLastCalledWith(expect.any(String), [
      "order",
      "pi_1",
      false,
      "paid",
    ])
  })
  it("holds already-refunded payments even if their completed event arrives later", async () => {
    intent.mockResolvedValue({
      status: "succeeded",
      amount_received: 2499,
      currency: "gbp",
      latest_charge: { amount_refunded: 2499, disputed: false },
    })
    await syncStationCheckout(session)
    expect(query).toHaveBeenLastCalledWith(expect.any(String), [
      "order",
      "pi_1",
      true,
      "refunded",
    ])
  })
  it("rejects a mismatched total without binding or paying an order", async () => {
    await expect(
      syncStationCheckout({ ...session, amount_total: 1 })
    ).rejects.toThrow("does not match")
    expect(query).toHaveBeenCalledTimes(1)
  })
  it("marks failed asynchronous payments without releasing hardware", async () => {
    await syncStationCheckout({ ...session, payment_status: "unpaid" }, true)
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining("payment_status = $2"),
      ["order", "failed"]
    )
  })
})
