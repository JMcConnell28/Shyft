import { afterEach, describe, expect, it, vi } from "vitest"
import type { PoolClient } from "pg"

import { refreshLocationClosingShiftSummaries } from "@/features/rota/server/location-summary-refresh"

describe("refreshLocationClosingShiftSummaries", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("persists recalculated hours after the closing time changes", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-24T12:00:00Z"))
    const query = vi.fn((sql: string, _parameters?: Array<unknown>) => {
      if (sql.includes("select rota.id")) {
        return Promise.resolve({
          rows: [{ id: "rota-1", week_start: "2026-09-21" }],
        })
      }

      if (
        sql.includes("from public.rota_shifts shift") &&
        !sql.includes("join")
      ) {
        return Promise.resolve({
          rows: [
            {
              id: "shift-1",
              rota_id: "rota-1",
              day_date: "2026-09-21",
              zone_id: "zone-1",
              zone_name_snapshot: "Bar",
              shift_type: "closing",
              start_time: "17:00:00",
              end_time: null,
              end_kind: "location_close",
              split_second_start_time: null,
              split_second_end_time: null,
            },
          ],
        })
      }

      if (sql.includes("from public.rota_shift_assignments")) {
        return Promise.resolve({
          rows: [
            {
              rota_id: "rota-1",
              rota_shift_id: "shift-1",
              employee_id: "employee-1",
            },
          ],
        })
      }

      return Promise.resolve({ rows: [] })
    })
    const client = { query } as unknown as PoolClient

    await refreshLocationClosingShiftSummaries({
      client,
      closingTimes: [
        { weekday: 1, closeTime: "01:00", closeTimeNextDay: true },
      ],
      estimatedClosingTime: "23:00",
      estimatedClosingTimeNextDay: false,
      locationId: "location-1",
      organizationId: "organization-1",
    })

    const updateCall = query.mock.calls.find(([sql]) =>
      sql.includes("update public.rotas")
    )
    const rotaLookupCall = query.mock.calls.find(([sql]) =>
      sql.includes("select rota.id")
    )

    expect(rotaLookupCall?.[0]).toContain("rota.week_start >= $3::date")
    expect(rotaLookupCall?.[1]).toEqual([
      "location-1",
      "organization-1",
      "2026-09-21",
    ])
    expect(updateCall?.[1]).toEqual(["rota-1", 8, 1, 1])
  })
})
