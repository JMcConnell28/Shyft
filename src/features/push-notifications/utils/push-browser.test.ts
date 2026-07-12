import { describe, expect, it } from "vitest"

import { urlBase64ToUint8Array } from "@/features/push-notifications/utils/push-browser"

describe("urlBase64ToUint8Array", () => {
  it("converts URL-safe base64 values", () => {
    expect(Array.from(urlBase64ToUint8Array("AQIDBA"))).toEqual([1, 2, 3, 4])
  })
})
