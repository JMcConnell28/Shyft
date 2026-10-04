import { describe, expect, it } from "vitest"

import { sageTimesheetExportInputSchema } from "@/features/timesheets/schemas/timesheet-schemas"

const input = {
  organizationId: "org-1",
  userId: "user-1",
  exportLocationId: "a904e3ba-b9c5-4c4e-a08e-b39b7a0a90d4",
  weekStart: "2026-06-01",
}

describe("weekly timesheet export validation", () => {
  it("accepts a location and week without a rota ID", () => {
    expect(sageTimesheetExportInputSchema.parse(input)).toEqual(input)
  })

  it.each(["2026-02-30", "2026-13-01", "invalid"])(
    "rejects invalid dates: %s",
    (weekStart) => {
      expect(
        sageTimesheetExportInputSchema.safeParse({ ...input, weekStart })
          .success
      ).toBe(false)
    }
  )

  it("requires a week and valid export location", () => {
    expect(
      sageTimesheetExportInputSchema.safeParse({
        ...input,
        weekStart: undefined,
      }).success
    ).toBe(false)
    expect(
      sageTimesheetExportInputSchema.safeParse({
        ...input,
        exportLocationId: "invalid",
      }).success
    ).toBe(false)
  })
})
