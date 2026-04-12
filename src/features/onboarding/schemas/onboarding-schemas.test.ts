import { describe, expect, it } from "vitest"

import {
  extractInviteDestination,
  normalizeOrganizationSlug,
  normalizeZoneName,
} from "@/features/onboarding/schemas/onboarding-schemas"

describe("onboarding schemas", () => {
  it("normalizes organization slugs into a clean path segment", () => {
    expect(normalizeOrganizationSlug(" The Red Lion Soho!! ")).toBe(
      "the-red-lion-soho",
    )
  })

  it("falls back to Zone 1 when the first zone is blank", () => {
    expect(normalizeZoneName("")).toBe("Zone 1")
    expect(normalizeZoneName("  ")).toBe("Zone 1")
    expect(normalizeZoneName("Beer Garden")).toBe("Beer Garden")
  })

  it("extracts staff join tokens from full URLs and raw tokens", () => {
    expect(
      extractInviteDestination(
        "https://app.shyft.local/join/abc123def456ghi789",
      ),
    ).toEqual({
      to: "/join/abc123def456ghi789",
    })

    expect(extractInviteDestination("abc123def456ghi789")).toEqual({
      to: "/join/abc123def456ghi789",
    })
  })

  it("extracts organization invitation paths", () => {
    expect(
      extractInviteDestination("/accept-invitation/invitation_123"),
    ).toEqual({
      to: "/accept-invitation/invitation_123",
    })
  })
})
