import { describe, expect, it } from "vitest"

import { isAppRoute } from "@/features/pwa/components/pwa-app-controller"

describe("installed app routes", () => {
  it("keeps the local demo in the app without redirecting to a workspace", () => {
    expect(isAppRoute("/demo")).toBe(true)
  })

  it("keeps a pending join request in the app", () => {
    expect(isAppRoute("/join-status/request-123")).toBe(true)
  })
})
