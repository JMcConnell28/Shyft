import { beforeEach, describe, expect, it, vi } from "vitest"

import { composeResponseSecurityHeaders } from "./response-headers"
import { createSecurityHeaders } from "./http-security"
import { downloadPersonalData } from "@/features/personal-data/server/download"

const { readReleased, session } = vi.hoisted(() => ({
  readReleased: vi.fn(),
  session: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@rocketrota/db/privacy", () => ({
  readReleasedPersonalDataResponse: readReleased,
}))
vi.mock("@/features/personal-data/server/access", () => ({
  requirePersonalDataSession: session,
}))
vi.mock("@/features/personal-data/server/report", () => ({
  renderPersonalDataReport: () =>
    "<!doctype html><p>Synthetic privacy fixture</p>",
}))
beforeEach(() => {
  vi.resetAllMocks()
  session.mockResolvedValue({ user: { id: "fixture-user" } })
  readReleased.mockResolvedValue({ fixture: true })
})

describe("download headers after global response composition", () => {
  it.each(["html", "json"])(
    "preserves the %s privacy download sandbox and applies global protections",
    async (format) => {
      const id = "00000000-0000-4000-8000-000000000001"
      const response = await downloadPersonalData(
        new Request(`https://app.example/privacy/${id}?format=${format}`),
        id
      )
      const securityHeaders = composeResponseSecurityHeaders(
        response.headers,
        createSecurityHeaders({ nonce: "fixture-nonce", production: true })
      )
      expect(response.status).toBe(200)
      const csp = securityHeaders.get("content-security-policy")
      expect(csp).toContain(
        "default-src 'none'; style-src 'unsafe-inline'; sandbox"
      )
      expect(csp).toContain("script-src 'self' 'nonce-fixture-nonce'")
      expect(response.headers.get("content-disposition")).toContain(
        "attachment;"
      )
      expect(response.headers.get("cache-control")).toContain("no-store")
      expect(securityHeaders.get("x-content-type-options")).toBe("nosniff")
    }
  )
  it("keeps the baseline policy when a route supplies a looser CSP", () => {
    const response = new Response("fixture", {
      headers: {
        "content-security-policy": "default-src *",
        "x-content-type-options": "off",
      },
    })
    const securityHeaders = composeResponseSecurityHeaders(
      response.headers,
      createSecurityHeaders({ nonce: "fixture-nonce", production: true })
    )
    expect(securityHeaders.get("content-security-policy")).toContain(
      "script-src 'self' 'nonce-fixture-nonce'"
    )
    expect(securityHeaders.get("x-content-type-options")).toBe("nosniff")
  })
})
