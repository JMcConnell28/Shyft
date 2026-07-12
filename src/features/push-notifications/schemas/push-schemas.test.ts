import { describe, expect, it } from "vitest"

import {
  pushPayloadSchema,
  savePushSubscriptionSchema,
} from "@/features/push-notifications/schemas/push-schemas"

describe("push subscription validation", () => {
  it("accepts a complete browser subscription", () => {
    expect(
      savePushSubscriptionSchema.safeParse({
        subscription: {
          endpoint: "https://push.example.test/subscriptions/device-123",
          keys: { auth: "abcdefgh", p256dh: "abcdefghijklmnopqrstuvwxyz" },
        },
      }).success
    ).toBe(true)
  })

  it("rejects incomplete encryption keys", () => {
    expect(
      savePushSubscriptionSchema.safeParse({
        subscription: {
          endpoint: "https://push.example.test/device",
          keys: { auth: "x", p256dh: "y" },
        },
      }).success
    ).toBe(false)
  })

  it("rejects external notification URLs", () => {
    expect(
      pushPayloadSchema.safeParse({
        title: "Test",
        body: "Test",
        data: { url: "https://evil.example" },
      }).success
    ).toBe(false)
  })
})
