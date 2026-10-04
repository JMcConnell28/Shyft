import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"

import { managerClockQueryOptions } from "@/features/time-clock/manager-query-options"

vi.mock("@/features/time-clock/server-fns", () => ({
  getManagerClockPageData: vi.fn(),
}))

describe("time tracking query cache", () => {
  it("reuses the route's loaded date without a duplicate page request", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: 30000 } },
    })
    const input = { date: "2026-06-01", organizationId: "org", userId: "user" }
    const fetcher = vi.fn(() =>
      Promise.resolve({
        selectedDate: input.date,
        writableLocationIds: [],
        locations: [],
        employees: [],
        activityEntries: [],
        failedAttempts: [],
        reviewEntries: [],
      })
    )
    await client.ensureQueryData(managerClockQueryOptions(input, fetcher))
    await client.fetchQuery(
      managerClockQueryOptions({ ...input, locationId: undefined }, fetcher)
    )
    expect(fetcher).toHaveBeenCalledTimes(1)
    await client.ensureQueryData(
      managerClockQueryOptions({ ...input, date: "2026-06-08" }, fetcher)
    )
    expect(fetcher).toHaveBeenCalledTimes(2)
    client.clear()
  })
})
