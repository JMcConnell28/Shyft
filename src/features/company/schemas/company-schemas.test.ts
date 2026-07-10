import { describe, expect, it } from "vitest"

import { rehireCompanyEmployeeInputSchema } from "@/features/company/schemas/company-schemas"

const workspaceInput = {
  employeeId: "123e4567-e89b-42d3-a456-426614174000",
  organizationId: "org-1",
  userId: "user-1",
}

describe("rehireCompanyEmployeeInputSchema", () => {
  it("requires at least one location", () => {
    const result = rehireCompanyEmployeeInputSchema.safeParse({
      ...workspaceInput,
      locationIds: [],
    })

    expect(result.success).toBe(false)
  })

  it("rejects duplicate locations", () => {
    const locationId = "550e8400-e29b-41d4-a716-446655440000"
    const result = rehireCompanyEmployeeInputSchema.safeParse({
      ...workspaceInput,
      locationIds: [locationId, locationId],
    })

    expect(result.success).toBe(false)
  })

  it("accepts distinct valid locations", () => {
    const result = rehireCompanyEmployeeInputSchema.safeParse({
      ...workspaceInput,
      locationIds: [
        "550e8400-e29b-41d4-a716-446655440000",
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      ],
    })

    expect(result.success).toBe(true)
  })
})
