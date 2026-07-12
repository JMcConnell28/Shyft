import { describe, expect, it } from "vitest"

import { getSafeNotificationPath } from "@/features/push-notifications/utils/safe-notification-url"

describe("getSafeNotificationPath", () => {
  it("accepts internal paths", () => {
    expect(getSafeNotificationPath("/w/demo/rota/123?view=week")).toBe(
      "/w/demo/rota/123?view=week"
    )
  })

  it.each([
    "https://evil.example",
    "//evil.example",
    "javascript:alert(1)",
    null,
  ])("rejects unsafe target %s", (value) =>
    expect(getSafeNotificationPath(value)).toBe("/dashboard")
  )
})
