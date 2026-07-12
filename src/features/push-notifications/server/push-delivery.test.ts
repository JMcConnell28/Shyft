import { describe, expect, it, vi } from "vitest"

import { deliverPushBatch } from "@/features/push-notifications/server/push-delivery"

const payload = { title: "Test", body: "Body", data: { url: "/dashboard" } }
const subscriptions = [
  { id: "one", userId: "user-1" },
  { id: "two", userId: "user-1" },
  { id: "three", userId: "user-1" },
]

describe("deliverPushBatch", () => {
  it("continues after a delivery failure", async () => {
    const send = vi.fn((subscription: (typeof subscriptions)[number]) => {
      if (subscription.id === "two") return Promise.reject(new Error("network failure"))
      return Promise.resolve()
    })
    const summary = await deliverPushBatch(subscriptions, payload, {
      send,
      onExpired: vi.fn(() => Promise.resolve()),
      onFailure: vi.fn(),
      onSent: vi.fn(() => Promise.resolve()),
    })

    expect(send).toHaveBeenCalledTimes(3)
    expect(summary).toEqual({ sent: 2, failed: 1, removed: 0 })
  })

  it.each([404, 410])(
    "removes expired subscriptions returning %s",
    async (statusCode) => {
    const onExpired = vi.fn(() => Promise.resolve())
    const summary = await deliverPushBatch([subscriptions[0]], payload, {
      send: vi.fn(() => Promise.reject({ statusCode })),
        onExpired,
        onFailure: vi.fn(),
      onSent: vi.fn(() => Promise.resolve()),
      })

      expect(onExpired).toHaveBeenCalledOnce()
      expect(summary).toEqual({ sent: 0, failed: 0, removed: 1 })
    }
  )
})
