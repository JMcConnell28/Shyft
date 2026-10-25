import { QueryClient } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { loadDashboardEntry } from "./load-dashboard-entry"
import { navigationQueryKeys } from "./query-keys"
import { getDashboardEntry } from "./server-fns"
import type { DashboardEntry } from "@/features/navigation/types/dashboard-entry"
import type { NavigationSession } from "@/features/navigation/types"

vi.mock("./server-fns", () => ({ getDashboardEntry: vi.fn() }))

const session: NavigationSession = {
  sessionId: "session-a",
  user: {
    id: "user-a",
    name: "Alex",
    email: "alex@example.com",
    emailVerified: true,
  },
  activeOrganizationId: null,
  expiresAt: Date.parse("2030-01-02"),
}
const entry: DashboardEntry = {
  sessionId: session.sessionId,
  userId: session.user.id,
  activeOrganizationId: "org-a",
  destination: { kind: "workspace", workspaceSlug: "team" },
}
let queryClient: QueryClient

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2030-01-01"))
  queryClient = new QueryClient()
  queryClient.setQueryData(navigationQueryKeys.session, session)
  vi.mocked(getDashboardEntry).mockResolvedValue(entry)
})
afterEach(() => {
  queryClient.clear()
  vi.useRealTimers()
})

describe("dashboard entry redirects", () => {
  it("updates the active organization without extending session freshness or seeding permissions", async () => {
    const updatedAt = queryClient.getQueryState(
      navigationQueryKeys.session
    )?.dataUpdatedAt
    vi.setSystemTime(new Date("2030-01-01T00:00:20Z"))
    await expect(
      loadDashboardEntry({ queryClient, navigationSession: session })
    ).rejects.toMatchObject({ options: { href: "/app/team/dashboard" } })
    expect(queryClient.getQueryData(navigationQueryKeys.session)).toMatchObject(
      { activeOrganizationId: "org-a" }
    )
    expect(
      queryClient.getQueryState(navigationQueryKeys.session)?.dataUpdatedAt
    ).toBe(updatedAt)
    expect(
      queryClient
        .getQueryCache()
        .findAll({ queryKey: navigationQueryKeys.viewers })
    ).toHaveLength(0)
  })

  it.each([
    null,
    { ...entry, userId: "other-user" },
    { ...entry, sessionId: "other-session" },
  ])(
    "clears navigation state for a missing or mismatched identity",
    async (value) => {
      vi.mocked(getDashboardEntry).mockResolvedValue(value)
      await expect(
        loadDashboardEntry({ queryClient, navigationSession: session })
      ).rejects.toMatchObject({ options: { to: "/login" } })
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    }
  )

  it("rejects a session that expired while startup was loading", async () => {
    vi.setSystemTime(new Date("2030-01-03"))
    await expect(
      loadDashboardEntry({ queryClient, navigationSession: session })
    ).rejects.toMatchObject({ options: { to: "/login" } })
  })

  it("preserves the pending join destination", async () => {
    vi.mocked(getDashboardEntry).mockResolvedValue({
      ...entry,
      destination: { kind: "join-status", requestId: "request-a" },
    })
    await expect(
      loadDashboardEntry({ queryClient, navigationSession: session })
    ).rejects.toMatchObject({
      options: {
        to: "/join-status/$requestId",
        params: { requestId: "request-a" },
      },
    })
  })

  it.each([
    "/onboarding/location",
    "/onboarding/join",
    "/onboarding/setup",
  ] as const)("preserves %s", async (path) => {
    vi.mocked(getDashboardEntry).mockResolvedValue({
      ...entry,
      destination: { kind: "onboarding", path },
    })
    await expect(
      loadDashboardEntry({ queryClient, navigationSession: session })
    ).rejects.toMatchObject({ options: { to: path } })
  })
})
