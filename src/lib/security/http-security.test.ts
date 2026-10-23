import { describe, expect, it } from "vitest"

import { createSecurityHeaders } from "../../../packages/shared/src/security/http-security"

describe("production response protections", () => {
  it("requires the request nonce for inline scripts and forbids framing", () => {
    const headers = createSecurityHeaders({
      nonce: "test-request-nonce",
      production: true,
    })
    const policy = headers.get("Content-Security-Policy")

    expect(policy).toContain("script-src 'self' 'nonce-test-request-nonce'")
    expect(policy).toContain("script-src-attr 'none'")
    expect(policy).not.toContain("unsafe-eval")
    expect(policy).toContain("frame-ancestors 'none'")
    expect(policy).toContain("object-src 'none'")
    expect(headers.get("X-Frame-Options")).toBe("DENY")
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff")
    expect(headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin"
    )
  })

  it("prevents shared caches from storing dynamic responses", () => {
    const headers = createSecurityHeaders({ nonce: "nonce", production: true })
    expect(headers.get("Cache-Control")).toBe("private, no-store")
    expect(headers.get("CDN-Cache-Control")).toBe("no-store")
    expect(headers.get("Surrogate-Control")).toBe("no-store")
  })

  it("keeps development script tooling working without weakening production scripts", () => {
    const headers = createSecurityHeaders({ nonce: "nonce", production: false })
    expect(headers.get("Content-Security-Policy")).not.toContain("script-src")
    expect(headers.get("X-Frame-Options")).toBe("DENY")
  })
})
