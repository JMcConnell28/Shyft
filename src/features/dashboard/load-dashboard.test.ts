import { QueryClient } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { loadDashboard } from "./load-dashboard"

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

describe("personal dashboard data loading", () => {
  it("loads shifts and announcements without requesting manager data", async () => {
    const result = await loadDashboard({
      queryClient,
      workspace: { id: "org", type: "organization" },
      userId: "employee",
    })
    expect(result).toEqual({
      announcements: { items: [] },
      overview: { thisWeekShifts: [] },
    })
    expect(mock.overview).toHaveBeenCalledTimes(1)
    expect(mock.announcements).toHaveBeenCalledTimes(1)
    expect(mock.manager).not.toHaveBeenCalled()
  })

  it("resolves useful content while the optional welcome request is still pending", async () => {
    mock.welcome.mockReturnValue(new Promise(() => {}))
    await loadDashboard({
      queryClient,
      workspace: { id: "org", type: "organization" },
      userId: "employee",
    })
    expect(mock.welcome).toHaveBeenCalledTimes(1)
    expect(mock.overview).toHaveBeenCalledTimes(1)
  })
})
