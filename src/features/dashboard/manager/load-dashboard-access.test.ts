import { QueryClient } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import { loadDashboardAccess } from "./load-dashboard-access"
import { managerDayOptions } from "./query-options"
import {
  getManagerDashboardAccess,
  getManagerDashboardAttention,
  getManagerDashboardDay,
} from "./server-fns"
import { dashboardLocation } from "./test-fixtures"
import { getOrgCapabilitiesForRole } from "@/lib/auth/workspace-capabilities"

vi.mock("./server-fns", () => ({
  getManagerDashboardAccess: vi.fn(),
  getManagerDashboardAttention: vi.fn(),
  getManagerDashboardDay: vi.fn(),
}))
afterEach(() => vi.resetAllMocks())

describe("dashboard loading", () => {
  it("waits for the staffing snapshot on the server and leaves optional attention for the client", async () => {
    const client = new QueryClient()
    vi.mocked(getManagerDashboardAccess).mockResolvedValue({
      locations: [dashboardLocation],
      capabilities: getOrgCapabilitiesForRole("manager"),
    })
    const data = {
      date: "2026-10-16",
      today: "2026-10-17",
      isToday: false,
      updatedAt: "2026-10-17",
      location: dashboardLocation,
      team: [],
      clockEmployees: [],
      planning: [],
    }
    let finish: () => void = () => {
      throw new Error("The staffing request has not started.")
    }
    vi.mocked(getManagerDashboardDay).mockReturnValue(
      new Promise((resolve) => {
        finish = () => resolve(data)
      })
    )
    let ready = false
    const loading = loadDashboardAccess(
      client,
      "org",
      "user",
      {},
      { serverRendering: true }
    ).then(() => {
      ready = true
    })
    await vi.waitFor(() =>
      expect(getManagerDashboardDay).toHaveBeenCalledTimes(1)
    )
    expect(ready).toBe(false)
    finish()
    await loading
    expect(
      client.getQueryData(
        managerDayOptions(
          { organizationId: "org", locationId: dashboardLocation.id },
          "user"
        ).queryKey
      )
    ).toEqual(data)
    expect(getManagerDashboardAttention).not.toHaveBeenCalled()
    client.clear()
  })

  it("surfaces an initial staffing failure through the route instead of rendering inconsistent server data", async () => {
    const client = new QueryClient()
    vi.mocked(getManagerDashboardAccess).mockResolvedValue({
      locations: [dashboardLocation],
      capabilities: getOrgCapabilitiesForRole("manager"),
    })
    vi.mocked(getManagerDashboardDay).mockRejectedValue(
      new Error("Staffing unavailable")
    )
    await expect(
      loadDashboardAccess(client, "org", "user", {}, { serverRendering: true })
    ).rejects.toThrow("Staffing unavailable")
    client.clear()
  })

  it("starts day and attention requests before the page mounts and deduplicates the mounted query", async () => {
    const client = new QueryClient()
    vi.mocked(getManagerDashboardAccess).mockResolvedValue({
      locations: [dashboardLocation],
      capabilities: getOrgCapabilitiesForRole("manager"),
    })
    vi.mocked(getManagerDashboardAttention).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 8,
      updatedAt: "2026-10-17",
    })
    vi.mocked(getManagerDashboardDay).mockResolvedValue({
      date: "2026-10-16",
      today: "2026-10-17",
      isToday: false,
      updatedAt: "2026-10-17",
      location: dashboardLocation,
      team: [],
      clockEmployees: [],
      planning: [],
    })
    const search = { location: dashboardLocation.id, date: "2026-10-16" }
    await loadDashboardAccess(client, "org", "user", search, {
      serverRendering: false,
    })
    expect(getManagerDashboardAttention).toHaveBeenCalledTimes(1)
    expect(getManagerDashboardDay).toHaveBeenCalledWith({
      data: {
        organizationId: "org",
        locationId: dashboardLocation.id,
        date: search.date,
      },
    })
    await client.fetchQuery(
      managerDayOptions(
        {
          organizationId: "org",
          locationId: dashboardLocation.id,
          date: search.date,
        },
        "user"
      )
    )
    expect(getManagerDashboardDay).toHaveBeenCalledTimes(1)
    client.clear()
  })
  it("never fetches a day for an inaccessible requested location", async () => {
    const client = new QueryClient()
    vi.mocked(getManagerDashboardAccess).mockResolvedValue({
      locations: [dashboardLocation],
      capabilities: getOrgCapabilitiesForRole("manager"),
    })
    vi.mocked(getManagerDashboardAttention).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 8,
      updatedAt: "2026-10-17",
    })
    await loadDashboardAccess(
      client,
      "org",
      "user",
      { location: "forged" },
      { serverRendering: false }
    )
    expect(getManagerDashboardDay).not.toHaveBeenCalled()
    client.clear()
  })
})
