import { QueryClient, QueryObserver } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import { employeeClockQueryOptions } from "./employee-query-options"
import type { EmployeeClockPageData } from "./types"

vi.mock("./server-fns", () => ({ getEmployeeClockPageData: vi.fn() }))

const data: EmployeeClockPageData = {
  scanSessionId: "scan",
  scanExpiresAt: "2026-10-25T09:15:00Z",
  clockLabel: "Clock",
  employee: { id: "employee", name: "Employee" },
  location: {
    id: "location",
    name: "Location",
    latitude: null,
    longitude: null,
    radiusMeters: 100,
    maxAccuracyMeters: 100,
  },
  openEntry: null,
  completedShiftSegments: [],
  matchedShift: null,
  reviewPrompt: {
    defaultMode: null,
    isReasonRequired: false,
    kind: "none",
    message: null,
    scheduledStartAt: null,
  },
  nextAction: "clock_in",
  isClockingEnabled: true,
  isWorkspaceReadOnly: false,
  setupMessage: null,
}

describe("clock scan query hydration", () => {
  it("reuses the verified loader result on mount and refreshes after invalidation", async () => {
    const client = new QueryClient()
    const fetcher = vi.fn().mockResolvedValue(data)
    const options = employeeClockQueryOptions(
      { scanSessionId: "scan", userId: "user" },
      data,
      fetcher
    )
    const observer = new QueryObserver(client, options)
    const unsubscribe = observer.subscribe(() => {})
    try {
      expect(observer.getCurrentResult().data).toEqual(data)
      expect(fetcher).not.toHaveBeenCalled()
      await client.invalidateQueries({ queryKey: options.queryKey })
      expect(fetcher).toHaveBeenCalledTimes(1)
    } finally {
      unsubscribe()
      client.clear()
    }
  })

  it("keeps clock scan snapshots isolated by user and scan session", () => {
    const key = employeeClockQueryOptions(
      { scanSessionId: "scan", userId: "user" },
      data
    ).queryKey
    expect(key).not.toEqual(
      employeeClockQueryOptions(
        { scanSessionId: "scan", userId: "other" },
        data
      ).queryKey
    )
    expect(key).not.toEqual(
      employeeClockQueryOptions(
        { scanSessionId: "other", userId: "user" },
        data
      ).queryKey
    )
  })
})
