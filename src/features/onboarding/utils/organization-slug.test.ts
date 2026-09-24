import { describe, expect, it } from "vitest"

import { getOrganizationSlugCandidate } from "@/features/onboarding/utils/organization-slug"

describe("generated organisation slugs", () => {
  it("adds a numeric suffix when the preferred URL is unavailable", () => {
    expect(getOrganizationSlugCandidate("Joe's Coffee Shop", 0)).toBe(
      "joe-s-coffee-shop"
    )
    expect(getOrganizationSlugCandidate("Joe's Coffee Shop", 1)).toBe(
      "joe-s-coffee-shop-2"
    )
  })

  it("keeps long and non-Latin names valid", () => {
    expect(getOrganizationSlugCandidate("☕️☕️", 0)).toBe("workspace")
    expect(getOrganizationSlugCandidate("A", 0)).toBe("a-workspace")
    expect(
      getOrganizationSlugCandidate(
        "A very long organisation name that goes beyond the URL limit",
        49
      ).length
    ).toBeLessThanOrEqual(48)
  })
})
