import { describe, expect, it } from "vitest"
import {
  pushEndpointInputSchema,
  pushEndpointSchema,
} from "@/features/push-notifications/schemas/push-schemas"

describe("push provider endpoint policy", () => {
  it.each([
    "https://fcm.googleapis.com/fcm/send/token",
    "https://fcm.googleapis.com/wp/token",
    "https://updates.push.services.mozilla.com/wpush/v2/token",
    "https://web.push.apple.com/token",
    "https://region.push.apple.com/token",
    "https://wns2-par02p.notify.windows.com/w/?token=opaque%2Fvalue",
    "https://fcm.googleapis.com:443/fcm/send/token",
  ])("accepts the supported provider endpoint %s", (endpoint) => {
    expect(pushEndpointSchema.safeParse(endpoint).success).toBe(true)
  })

  it.each([
    "https://127.0.0.1:8443/",
    "https://localhost/push",
    "https://10.0.0.1/",
    "https://169.254.169.254/latest/meta-data/",
    "https://[::1]/",
    "https://[::ffff:127.0.0.1]/",
    "https://2130706433/",
    "https://0x7f000001/",
    "https://0177.0.0.1/",
    "http://fcm.googleapis.com/fcm/send/token",
    "file:///etc/passwd",
    "https://fcm.googleapis.com:8443/fcm/send/token",
    "https://user:password@fcm.googleapis.com/fcm/send/token",
    "https://fcm.googleapis.com@evil.example/token",
    "https://fcm.googleapis.com.evil.example/token",
    "https://evilpush.apple.com/token",
    "https://push.apple.com.evil.example/token",
    "https://notify.windows.com.evil.example/token",
    "https://updates.push.services.mozilla.com.evil.example/token",
    "https://attacker.example/token",
    "https://fcm.googleapis.com./token",
    "https://fcm.googleapis.com/token#fragment",
    "https://fcm.googleapis.com/token#",
    " https://fcm.googleapis.com/token",
    "https://fcm.googlea\npis.com/token",
    "https://fcm.googleapis.com\\@evil.example/token",
  ])("rejects the unsafe endpoint %s", (endpoint) => {
    expect(pushEndpointSchema.safeParse(endpoint).success).toBe(false)
  })

  it("still permits removal of a historical unsupported endpoint", () => {
    expect(
      pushEndpointInputSchema.safeParse({
        endpoint: "https://old.example/device",
      }).success
    ).toBe(true)
  })
})
