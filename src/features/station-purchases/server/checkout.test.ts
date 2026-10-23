import { beforeEach, describe, expect, it, vi } from "vitest"
import { createStationCheckout } from "./checkout"

const { eligibility, price, reserve, create, retrieve, query } = vi.hoisted(
  () => ({
    eligibility: vi.fn(),
    price: vi.fn(),
    reserve: vi.fn(),
    create: vi.fn(),
    retrieve: vi.fn(),
    query: vi.fn(),
  })
)
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("./queries", () => ({
  getPurchaseEligibility: eligibility,
  getStationPrice: price,
}))
vi.mock("./orders", () => ({ reserveStationOrder: reserve }))
vi.mock("@/features/billing/server/urls", () => ({
  buildAppUrl: (path: string) => `https://app.example.test${path}`,
}))
vi.mock("@/features/billing/server/stripe", () => ({
  getStripe: () => ({ checkout: { sessions: { create, retrieve } } }),
}))
const input = {
  locationId: "00000000-0000-4000-8000-000000000001",
  purchaseId: "00000000-0000-4000-8000-000000000002",
  returnPath: "/app/demo/settings/billing",
  deliveryAddress: {
    name: "Recipient",
    line1: "Test address",
    city: "Derry",
    postcode: "BT48 1AA",
    country: "GB" as const,
  },
}
const order = {
  id: input.purchaseId,
  location_id: input.locationId,
  stripe_price_id: "price_station",
  unit_amount: 2499,
  stripe_customer_id: "cus_owner",
  billing_account_id: "account",
  stripe_checkout_session_id: null,
  return_path: input.returnPath,
}
beforeEach(() => {
  vi.clearAllMocks()
  eligibility.mockResolvedValue(null)
  price.mockResolvedValue({ id: "price_station", unit_amount: 2499 })
  reserve.mockResolvedValue(order)
  create.mockResolvedValue({
    id: "cs_station",
    status: "open",
    url: "https://checkout.stripe.com/test",
  })
  retrieve.mockResolvedValue({
    id: "cs_station",
    status: "open",
    url: "https://checkout.stripe.com/test",
  })
  query.mockResolvedValue({ rows: [] })
})
describe("one-off station checkout", () => {
  it("uses one hardware line, a stable idempotency key and the stored customer", async () => {
    await createStationCheckout(input, "owner")
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        customer: "cus_owner",
        line_items: [{ price: "price_station", quantity: 1 }],
      }),
      { idempotencyKey: `station-purchase/${input.purchaseId}` }
    )
    expect(create.mock.calls[0]?.[0]).not.toHaveProperty("subscription_data")
  })
  it("reuses an existing checkout instead of creating a second charge opportunity", async () => {
    reserve.mockResolvedValue({
      ...order,
      stripe_checkout_session_id: "cs_existing",
    })
    await createStationCheckout(input, "owner")
    expect(retrieve).toHaveBeenCalledWith("cs_existing")
    expect(create).not.toHaveBeenCalled()
  })
  it("does not create a checkout during trial or without paid T&A", async () => {
    eligibility.mockResolvedValue("Paid Time & Attendance required")
    await expect(createStationCheckout(input, "owner")).rejects.toThrow(
      "Paid Time & Attendance"
    )
    expect(reserve).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })
  it("cannot start checkout until an actual Stripe price is configured", async () => {
    price.mockResolvedValue(null)
    await expect(createStationCheckout(input, "owner")).rejects.toThrow(
      "not been enabled"
    )
    expect(create).not.toHaveBeenCalled()
  })
})
