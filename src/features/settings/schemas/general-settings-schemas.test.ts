import { describe, expect, it } from "vitest"

import { updateGeneralSettingsInputSchema } from "@/features/settings/schemas/general-settings-schemas"

const baseInput = {
  organizationId: "org-1",
  userId: "user-1",
}

describe("updateGeneralSettingsInputSchema", () => {
  it("accepts empty optional contact details", () => {
    expect(
      updateGeneralSettingsInputSchema.safeParse({
        ...baseInput,
        contactEmail: "",
        contactPhone: "",
      }).success
    ).toBe(true)
  })

  it("accepts valid workplace contact details", () => {
    expect(
      updateGeneralSettingsInputSchema.safeParse({
        ...baseInput,
        contactEmail: "hello@rocketrota.com",
        contactPhone: "+44 (0) 20 1234 5678",
      }).success
    ).toBe(true)
  })

  it("rejects malformed contact details", () => {
    const result = updateGeneralSettingsInputSchema.safeParse({
      ...baseInput,
      contactEmail: "not-an-email",
      contactPhone: "call us",
    })

    expect(result.success).toBe(false)
  })
})
