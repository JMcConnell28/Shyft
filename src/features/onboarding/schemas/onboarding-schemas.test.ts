import { describe, expect, it } from "vitest"

import {
  extractInviteDestination,
  locationSetupSchema,
  normalizeOrganizationSlug,
  normalizeZoneName,
  signUpSchema,
} from "@/features/onboarding/schemas/onboarding-schemas"

describe("onboarding schemas", () => {
  it("normalizes organization slugs into a clean path segment", () => {
    expect(normalizeOrganizationSlug(" The Red Lion Soho!! ")).toBe(
      "the-red-lion-soho"
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
        "https://app.rocketrota.local/join/abc123def456ghi789"
      )
    ).toEqual({
      to: "/join/abc123def456ghi789",
    })

    expect(extractInviteDestination("abc123def456ghi789")).toEqual({
      to: "/join/abc123def456ghi789",
    })
  })

  it("extracts organization invitation paths", () => {
    expect(
      extractInviteDestination("/accept-invitation/invitation_123")
    ).toEqual({
      to: "/accept-invitation/invitation_123",
    })
  })

  it("captures first and last names separately during signup", () => {
    expect(
      signUpSchema.safeParse({
        firstName: "Jane",
        lastName: "Smith",
        dateOfBirth: "1998-04-12",
        email: "jane@example.com",
        password: "password123",
      }).success
    ).toBe(true)
  })

  it("rejects signup when date of birth is in the future", () => {
    const futureDate = new Date()
    futureDate.setUTCFullYear(futureDate.getUTCFullYear() + 1)

    expect(
      signUpSchema.safeParse({
        firstName: "Jane",
        lastName: "Smith",
        dateOfBirth: futureDate.toISOString().slice(0, 10),
        email: "jane@example.com",
        password: "password123",
      }).success
    ).toBe(false)
  })

  it("accepts fixed-location setup with at least one area", () => {
    expect(
      locationSetupSchema.safeParse({
        businessType: "hospitality",
        planningMode: "fixed_location",
        locationName: "The Crown",
        zoneNames: ["Bar"],
        worksiteName: "",
      }).success
    ).toBe(true)
  })

  it("rejects fixed-location setup without areas", () => {
    expect(
      locationSetupSchema.safeParse({
        businessType: "retail",
        planningMode: "fixed_location",
        locationName: "Main Street Shop",
        zoneNames: [],
        worksiteName: "",
      }).success
    ).toBe(false)
  })

  it("accepts variable-location setup without a first worksite", () => {
    expect(
      locationSetupSchema.safeParse({
        businessType: "cleaning",
        planningMode: "variable_location",
        locationName: "North London Cleaning",
        zoneNames: [],
        worksiteName: "",
      }).success
    ).toBe(true)
  })

  it("rejects mismatched business type and planning mode", () => {
    expect(
      locationSetupSchema.safeParse({
        businessType: "security",
        planningMode: "fixed_location",
        locationName: "City Security",
        zoneNames: ["Post"],
        worksiteName: "",
      }).success
    ).toBe(false)
  })
})
