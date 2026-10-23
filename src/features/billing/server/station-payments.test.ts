import { beforeEach, describe, expect, it, vi } from "vitest"
import { recordStationPayment } from "./station-payments"
import type Stripe from "stripe"

const query = vi.hoisted(() => vi.fn())
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("./stripe", () => ({
  getOptionalTimeAttendanceEmployeePriceId: () => "price_ta",
  getStripe: vi.fn(),
}))

function invoice(overrides: Partial<Stripe.Invoice> = {}): Stripe.Invoice {
  return {
    id: "in_paid",
    livemode: true,
    created: 1780000000,
    status: "paid",
    amount_paid: 2500,
    currency: "gbp",
    status_transitions: { paid_at: 1780000001 },
    ...overrides,
  } as Stripe.Invoice
}
const subscription = {
  id: "sub_paid",
  items: { data: [{ price: { id: "price_ta" } }] },
} as Stripe.Subscription

describe("station payment evidence", () => {
  beforeEach(() => {
    query.mockReset()
    query.mockResolvedValue({ rows: [] })
  })
  it.each([
    { livemode: false },
    { amount_paid: 0 },
    { status: "open" as const },
    { status: "void" as const },
  ])("rejects unpaid and zero-value invoices: %j", async (overrides) => {
    await recordStationPayment(invoice(overrides), subscription)
    expect(query).not.toHaveBeenCalled()
  })
  it("records the invoice once and identifies T&A coverage, including the included first ten employees", async () => {
    await recordStationPayment(invoice(), subscription)
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("on conflict (stripe_invoice_id) do nothing"),
      expect.arrayContaining(["in_paid", "sub_paid", 2500, "gbp", true])
    )
  })
  it("does not identify a core-only payment as T&A coverage", async () => {
    await recordStationPayment(invoice(), {
      ...subscription,
      items: { ...subscription.items, data: [] },
    })
    expect(query.mock.calls[0]?.[1].at(-1)).toBe(false)
  })
})
