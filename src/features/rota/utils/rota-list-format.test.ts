import { describe, expect, it } from "vitest"

import { formatRotaUpdatedLabel } from "@/features/rota/utils/rota-list-format"

describe("formatRotaUpdatedLabel", () => {
  it("removes the time from published rota metadata", () => {
    expect(
      formatRotaUpdatedLabel({
        status: "published",
        updatedAt: "5 Jul 2025, 14:30",
      })
    ).toBe("Published on 5 Jul 2025")
  })

  it("uses today for drafts edited on the current date", () => {
    expect(
      formatRotaUpdatedLabel(
        {
          status: "draft",
          updatedAt: "12 Jul 2026, 09:15",
        },
        new Date(2026, 6, 12)
      )
    ).toBe("Last edited today")
  })
})
