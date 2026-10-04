import { beforeEach, describe, expect, it, vi } from "vitest"
import type Stripe from "stripe"

import { validateSubscriptionPrices } from "@/features/billing/server/subscription-prices"
import {
  buildSubscriptionItems,
  buildSubscriptionLineItems,
} from "@/features/billing/server/subscription-items"

const { retrievePrice, retrieveMeter } = vi.hoisted(() => ({
  retrievePrice: vi.fn(),
  retrieveMeter: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: vi.fn() }))
vi.mock("@/features/billing/server/stripe", () => ({
  getStripe: () => ({
    prices: { retrieve: retrievePrice },
    billing: { meters: { retrieve: retrieveMeter } },
  }),
  getCoreBasePriceId: () => "base",
  getCoreExtraEmployeePriceId: () => "extra",
  getTimeAttendanceEmployeePriceId: () => "attendance",
  getCoreExtraEmployeeMeterEventName: () => "extra_usage",
  getTimeAttendanceEmployeeMeterEventName: () => "attendance_usage",
}))

function price(id: string, amount: number): Stripe.Price {
  return {
    id,
    object: "price",
    active: true,
    billing_scheme: "per_unit",
    currency: "gbp",
    created: 1,
    custom_unit_amount: null,
    livemode: false,
    lookup_key: null,
    metadata: {},
    nickname: null,
    product: `product-${id}`,
    recurring: {
      interval: "month",
      interval_count: 1,
      trial_period_days: null,
      usage_type: id === "base" ? "licensed" : "metered",
      meter: id === "base" ? null : `meter-${id}`,
    },
    tax_behavior: "exclusive",
    tiers_mode: null,
    transform_quantity: null,
    type: "recurring",
    unit_amount: amount,
    unit_amount_decimal: String(amount),
  }
}

beforeEach(() => {
  vi.resetAllMocks()
  retrievePrice.mockImplementation((id: string) =>
    Promise.resolve(
      price(id, id === "base" ? 2500 : id === "extra" ? 250 : 100)
    )
  )
  retrieveMeter.mockImplementation((id: string) =>
    Promise.resolve({
      status: "active",
      event_name: id === "meter-extra" ? "extra_usage" : "attendance_usage",
      default_aggregation: { formula: "sum" },
      customer_mapping: { event_payload_key: "stripe_customer_id" },
      value_settings: { event_payload_key: "value" },
      event_time_window: null,
    })
  )
})

describe("Stripe subscription price validation", () => {
  it("allows the fixed base fee and metered employee prices", async () => {
    await expect(validateSubscriptionPrices()).resolves.toBeUndefined()
  })

  it("rejects a fixed T&A price before attaching a charge", async () => {
    retrievePrice.mockImplementation((id: string) => {
      const result = price(
        id,
        id === "base" ? 2500 : id === "extra" ? 250 : 100
      )
      if (id === "attendance" && result.recurring) {
        result.recurring.usage_type = "licensed"
        result.recurring.meter = null
      }
      return Promise.resolve(result)
    })
    await expect(validateSubscriptionPrices()).rejects.toThrow(
      "must use a metered Stripe price"
    )
  })

  it("rejects legacy metered prices without a Billing Meter", async () => {
    retrievePrice.mockImplementation((id: string) => {
      const result = price(
        id,
        id === "base" ? 2500 : id === "extra" ? 250 : 100
      )
      if (result.recurring) result.recurring.meter = null
      return Promise.resolve(result)
    })
    await expect(validateSubscriptionPrices()).rejects.toThrow("billing meter")
  })

  it("rejects a meter that counts submissions instead of summing employees", async () => {
    retrieveMeter.mockResolvedValue({
      status: "active",
      event_name: "extra_usage",
      default_aggregation: { formula: "count" },
    })
    await expect(validateSubscriptionPrices()).rejects.toThrow(
      "incompatible Stripe billing meter"
    )
  })

  it("omits quantity on metered items in checkout and direct subscriptions", async () => {
    const expected = [
      { price: "base", quantity: 1 },
      { price: "extra" },
      { price: "attendance" },
    ]
    expect(await buildSubscriptionLineItems()).toEqual(expected)
    expect(await buildSubscriptionItems()).toEqual(expected)
  })
})
