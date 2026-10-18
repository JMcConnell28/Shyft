import { QueryClient } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { loadDashboard } from "./load-dashboard"
import { getOrgCapabilitiesForRole } from "@/lib/auth/workspace-capabilities"

const mock = vi.hoisted(() => ({
  welcome: vi.fn(),
  announcements: vi.fn(),
  overview: vi.fn(),
  manager: vi.fn(),
}))
vi.mock("./query-options", () => ({
  dashboardWelcomeQueryOptions: () => ({
    queryKey: ["welcome"],
    queryFn: mock.welcome,
  }),
}))
vi.mock("./shift-overview-query-options", () => ({
  shiftOverviewQueryOptions: () => ({
    queryKey: ["overview"],
    queryFn: mock.overview,
  }),
}))
vi.mock("@/features/announcements/query-options", () => ({
  dashboardAnnouncementsQueryOptions: () => ({
    queryKey: ["announcements"],
    queryFn: mock.announcements,
  }),
}))
vi.mock("./manager/load-dashboard-access", () => ({
  loadDashboardAccess: mock.manager,
}))

let queryClient: QueryClient
beforeEach(() => {
  vi.resetAllMocks()
  queryClient = new QueryClient()
  mock.welcome.mockResolvedValue({ shouldShow: false })
  mock.announcements.mockResolvedValue({ items: [] })
  mock.overview.mockResolvedValue({ thisWeekShifts: [] })
  mock.manager.mockResolvedValue(undefined)
})
afterEach(() => queryClient.clear())

describe("dashboard data loading by role and selected view", () => {
  it("keeps employees on personal data when a manager view is requested", async () => {
    const result = await loadDashboard({
      queryClient,
      workspace: { id: "org", type: "organization" },
      userId: "employee",
      capabilities: getOrgCapabilitiesForRole("employee"),
      search: { view: "manager" },
    })
    expect(result.mode).toBe("employee")
    expect(mock.overview).toHaveBeenCalledTimes(1)
    expect(mock.announcements).toHaveBeenCalledTimes(1)
    expect(mock.manager).not.toHaveBeenCalled()
  })

  it("loads manager data without fetching the personal dashboard", async () => {
    const search = { date: "2026-10-18", location: "permitted" }
    const result = await loadDashboard({
      queryClient,
      workspace: { id: "org", type: "organization" },
      userId: "manager",
      capabilities: getOrgCapabilitiesForRole("manager"),
      search,
    })
    expect(result.mode).toBe("manager")
    expect(mock.manager).toHaveBeenCalledWith(
      queryClient,
      "org",
      "manager",
      search
    )
    expect(mock.overview).not.toHaveBeenCalled()
    expect(mock.announcements).not.toHaveBeenCalled()
  })

  it("lets managers choose their personal dashboard without manager requests", async () => {
    const result = await loadDashboard({
      queryClient,
      workspace: { id: "org", type: "organization" },
      userId: "manager",
      capabilities: getOrgCapabilitiesForRole("manager"),
      search: { view: "personal" },
    })
    expect(result.mode).toBe("employee")
    expect(mock.overview).toHaveBeenCalledTimes(1)
    expect(mock.manager).not.toHaveBeenCalled()
    expect(result.welcome.shouldShow).toBe(false)
  })
})
