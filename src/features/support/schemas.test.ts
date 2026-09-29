import { describe, expect, it } from "vitest"

import {
  createSupportThreadSchema,
  replyToSupportThreadSchema,
} from "@/features/support/schemas"

const input = {
  organizationId: "org-1",
  category: "support",
  locationId: null,
  subject: "Question",
  body: "How do I publish a rota?",
}

describe("support input validation", () => {
  it("accepts the three customer categories", () => {
    for (const category of ["support", "bug", "feature_request"]) {
      expect(
        createSupportThreadSchema.safeParse({ ...input, category }).success
      ).toBe(true)
    }
  })

  it("treats older requests without a location as organisation-wide", () => {
    const { locationId: _locationId, ...previousInput } = input
    expect(createSupportThreadSchema.parse(previousInput).locationId).toBe(null)
  })

  it("rejects empty and oversized messages", () => {
    expect(
      createSupportThreadSchema.safeParse({ ...input, body: " " }).success
    ).toBe(false)
    expect(
      createSupportThreadSchema.safeParse({ ...input, body: "x".repeat(5001) })
        .success
    ).toBe(false)
  })

  it("does not accept caller-controlled user or priority fields", () => {
    const parsed = createSupportThreadSchema.parse({
      ...input,
      userId: "other",
      priority: "urgent",
    })
    expect(parsed).not.toHaveProperty("userId")
    expect(parsed).not.toHaveProperty("priority")
  })

  it("rejects an invalid location identifier", () => {
    expect(
      createSupportThreadSchema.safeParse({
        ...input,
        locationId: "other-workplace",
      }).success
    ).toBe(false)
  })

  it("requires a thread id for replies", () => {
    expect(
      replyToSupportThreadSchema.safeParse({
        organizationId: "org-1",
        body: "Reply",
      }).success
    ).toBe(false)
  })
})
