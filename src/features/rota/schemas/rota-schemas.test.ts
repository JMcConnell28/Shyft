import { describe, expect, it } from "vitest"

import {
  getWeekRangeFromStart,
  normalizeOptionalIsoDate,
  normalizeWeekStart,
  parseRotaListSearch,
} from "@/features/rota/schemas/rota-schemas"

describe("rota schemas", () => {
  it("normalizes valid ISO dates and rejects invalid ones", () => {
    expect(normalizeOptionalIsoDate("2026-04-01")).toBe("2026-04-01")
    expect(normalizeOptionalIsoDate("2026-04-31")).toBeUndefined()
    expect(normalizeOptionalIsoDate("01/04/2026")).toBeUndefined()
  })

  it("snaps any selected date back to the Monday of that week", () => {
    expect(normalizeWeekStart("2026-04-01")).toBe("2026-03-30")
  })

  it("builds a consistent week summary label", () => {
    expect(getWeekRangeFromStart("2026-03-30").summaryLabel).toBe(
      "Week of 30 Mar - 5 Apr 2026",
    )
  })

  it("parses rota search params into a stable filter shape", () => {
    expect(
      parseRotaListSearch({
        range: "custom",
        from: "2026-04-20",
        to: "2026-04-01",
        page: "2",
        pageSize: "50",
        status: "published",
        location: "shoreditch-bar",
      }),
    ).toEqual({
      from: "2026-04-20",
      location: "shoreditch-bar",
      page: 2,
      pageSize: 50,
      range: "custom",
      status: "published",
      to: "2026-04-01",
    })
  })

  it("falls back to default filters for invalid search params", () => {
    expect(parseRotaListSearch({ page: "-4", pageSize: "999" })).toEqual({
      from: undefined,
      location: undefined,
      page: 1,
      pageSize: 20,
      range: "all",
      status: "all",
      to: undefined,
    })
  })
})
