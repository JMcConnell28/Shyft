import { afterEach, describe, expect, it, vi } from "vitest"

import { getRecoverySource, normalizeRecoveryAddress } from "./recovery-source"

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/env.server", () => ({
  getOptionalEnv: (name: string) => process.env[name],
}))
afterEach(() => vi.unstubAllEnvs())

describe("recovery source identity", () => {
  it.each([
    ["192.0.2.1", "192.0.2.1"],
    ["::ffff:192.0.2.1", "192.0.2.1"],
    ["2001:db8:1:2::1", "2001:db8:1:2::/64"],
    ["2001:0db8:0001:0002:ffff:ffff:ffff:ffff", "2001:db8:1:2::/64"],
    ["fe80::1%eth0", null],
    ["192.0.2.1, 192.0.2.2", null],
    ["untrusted", null],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeRecoveryAddress(input)).toBe(expected)
  })

  it("ignores forged forwarding headers by default and uses native context", () => {
    vi.stubEnv("AUTH_RECOVERY_TRUSTED_IP_HEADER", "")
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "192.0.2.1", "x-real-ip": "192.0.2.2" },
    })
    expect(getRecoverySource(request)).toBeNull()
    Object.assign(request, { context: { clientAddress: "192.0.2.3" } })
    expect(getRecoverySource(request)).toBe("192.0.2.3")
  })

  it("uses an explicitly configured sanitized single-IP header", () => {
    vi.stubEnv("AUTH_RECOVERY_TRUSTED_IP_HEADER", "x-real-ip")
    const request = new Request("http://localhost", {
      headers: { "x-real-ip": "192.0.2.1" },
    })
    expect(getRecoverySource(request)).toBe("192.0.2.1")
    request.headers.set("x-real-ip", "192.0.2.1, 192.0.2.2")
    expect(getRecoverySource(request)).toBeNull()
  })
})
