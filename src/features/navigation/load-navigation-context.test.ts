import { QueryClient } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type {
  NavigationSession,
  WorkspaceViewer,
} from "@/features/navigation/types"
import {
  loadNavigationSession,
  loadWorkspaceViewer,
} from "@/features/navigation/load-navigation-context"
import { navigationQueryKeys } from "@/features/navigation/query-keys"
import {
  getNavigationSession,
  getWorkspaceViewer,
} from "@/features/navigation/server-fns"
import { activateOrganization } from "@/features/onboarding/server/organization-actions"

vi.mock("@/features/navigation/server-fns", () => ({
  getNavigationSession: vi.fn(),
  getWorkspaceViewer: vi.fn(),
}))
vi.mock("@/features/onboarding/server/organization-actions", () => ({
  activateOrganization: vi.fn(),
}))
vi.mock("@/features/onboarding/server/viewer", () => ({
  getViewerState: vi.fn(),
}))

const session: NavigationSession = {
  sessionId: "session-a",
  expiresAt: Date.parse("2030-01-02"),
  activeOrganizationId: "org-a",
  user: {
    id: "user-a",
    name: "Alex",
    email: "alex@example.com",
    emailVerified: true,
  },
}
const workspace = {
  id: "org-a",
  name: "Team",
  slug: "team",
  type: "organization",
  organizationId: "org-a",
} as const
const viewer: WorkspaceViewer = {
  user: session.user,
  organizations: [workspace],
  activeOrganization: workspace,
  activeWorkspace: workspace,
  activeRole: "owner",
  workspaces: [workspace],
  trial: null,
  billing: null,
}
const options = { preload: false, href: "/w/team/dashboard" }
let queryClient: QueryClient

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2030-01-01"))
  vi.resetAllMocks()
  queryClient = new QueryClient()
  vi.mocked(getNavigationSession).mockResolvedValue(session)
  vi.mocked(getWorkspaceViewer).mockResolvedValue(viewer)
  vi.mocked(activateOrganization).mockResolvedValue({ success: true })
})

afterEach(() => {
  queryClient.clear()
  vi.useRealTimers()
})

async function navigate(slug = "team") {
  const navigationSession = await loadNavigationSession(
    queryClient,
    options.href
  )
  return loadWorkspaceViewer({ queryClient, navigationSession }, slug, options)
}

describe("navigation caching", () => {
  it("deduplicates concurrent preloads and adds no viewer/session requests on warm navigation", async () => {
    await Promise.all([navigate(), navigate()])
    await navigate()
    expect(getNavigationSession).toHaveBeenCalledTimes(1)
    expect(getWorkspaceViewer).toHaveBeenCalledTimes(1)
    expect(activateOrganization).not.toHaveBeenCalled()
  })

  it("revalidates after 30 seconds and after explicit invalidation", async () => {
    await navigate()
    vi.setSystemTime(new Date("2030-01-01T00:00:31Z"))
    await navigate()
    expect(getWorkspaceViewer).toHaveBeenCalledTimes(2)
    await queryClient.invalidateQueries({ queryKey: navigationQueryKeys.all })
    await navigate()
    expect(getNavigationSession).toHaveBeenCalledTimes(3)
    expect(getWorkspaceViewer).toHaveBeenCalledTimes(3)
  })

  it("uses separate entries for different workspaces and sessions", async () => {
    await navigate()
    await navigate("another-team")
    await queryClient.invalidateQueries({
      queryKey: navigationQueryKeys.session,
    })
    vi.mocked(getNavigationSession).mockResolvedValue({
      ...session,
      sessionId: "session-b",
    })
    await navigate()
    expect(getWorkspaceViewer).toHaveBeenCalledTimes(3)
    expect(getWorkspaceViewer).toHaveBeenLastCalledWith({
      data: {
        workspaceSlug: "team",
        userId: "user-a",
        sessionId: "session-b",
      },
    })
  })

  it("keeps navigation data isolated between SSR request query clients", async () => {
    await navigate()
    const otherClient = new QueryClient()
    try {
      const navigationSession = await loadNavigationSession(
        otherClient,
        options.href
      )
      await loadWorkspaceViewer(
        { queryClient: otherClient, navigationSession },
        "team",
        options
      )
      expect(getNavigationSession).toHaveBeenCalledTimes(2)
      expect(getWorkspaceViewer).toHaveBeenCalledTimes(2)
    } finally {
      otherClient.clear()
    }
  })

  it("revalidates an expired session even while its cache entry is fresh", async () => {
    vi.mocked(getNavigationSession).mockResolvedValue({
      ...session,
      expiresAt: Date.now() + 1000,
    })
    await navigate()
    vi.setSystemTime(new Date("2030-01-01T00:00:02Z"))
    vi.mocked(getNavigationSession).mockResolvedValue(null)
    await expect(navigate()).rejects.toMatchObject({
      options: { to: "/login" },
    })
    expect(getNavigationSession).toHaveBeenCalledTimes(2)
    expect(
      queryClient.getQueryCache().findAll({ queryKey: navigationQueryKeys.all })
    ).toHaveLength(0)
  })

  it("does not keep a signed-out result that would block a later sign-in", async () => {
    vi.mocked(getNavigationSession).mockResolvedValueOnce(null)
    await expect(navigate()).rejects.toMatchObject({
      options: { to: "/login" },
    })
    await expect(navigate()).resolves.toMatchObject({ user: session.user })
  })

  it("does not retain an inaccessible workspace as a fresh negative result", async () => {
    vi.mocked(getWorkspaceViewer).mockResolvedValueOnce(null)
    await expect(navigate()).rejects.toMatchObject({
      options: { to: "/dashboard" },
    })
    await expect(navigate()).resolves.toMatchObject({
      activeWorkspace: workspace,
    })
  })
})

describe("workspace activation", () => {
  it("stops speculative routing without a redirect loop, then loads on navigation", async () => {
    const context = {
      queryClient,
      navigationSession: { ...session, activeOrganizationId: null },
    }
    const root = createRootRoute()
    const loader = vi.fn()
    const route = createRoute({
      getParentRoute: () => root,
      path: "/w/$workspaceSlug/dashboard",
      beforeLoad: ({ params, preload, location }) =>
        loadWorkspaceViewer(context, params.workspaceSlug, {
          preload,
          href: location.href,
        }),
      loader,
    })
    const router = createRouter({
      routeTree: root.addChildren([route]),
      history: createMemoryHistory({ initialEntries: ["/w/team/dashboard"] }),
    })
    await router.preloadRoute({
      to: "/w/$workspaceSlug/dashboard",
      params: { workspaceSlug: "team" },
    })
    expect(activateOrganization).not.toHaveBeenCalled()
    expect(loader).not.toHaveBeenCalled()
    await router.load()
    expect(activateOrganization).toHaveBeenCalledTimes(1)
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it("warms another organization's viewer without changing the session on hover", async () => {
    const navigationSession = { ...session, activeOrganizationId: "other-org" }
    const context = { queryClient, navigationSession }
    await expect(
      loadWorkspaceViewer(context, "team", { ...options, preload: true })
    ).rejects.toMatchObject({ options: { href: options.href } })
    expect(activateOrganization).not.toHaveBeenCalled()

    await loadWorkspaceViewer(context, "team", options)
    expect(getWorkspaceViewer).toHaveBeenCalledTimes(1)
    expect(activateOrganization).toHaveBeenCalledWith({
      data: { organizationId: "org-a" },
    })
  })

  it("activates a linked location's organization before page loaders run", async () => {
    vi.mocked(getWorkspaceViewer).mockResolvedValue({
      ...viewer,
      activeOrganization: null,
      activeWorkspace: { ...workspace, id: "location-a", type: "location" },
    })
    await loadWorkspaceViewer(
      {
        queryClient,
        navigationSession: { ...session, activeOrganizationId: null },
      },
      "team",
      options
    )
    expect(activateOrganization).toHaveBeenCalledWith({
      data: { organizationId: "org-a" },
    })
  })

  it("does not extend session freshness just because organization activation occurred", async () => {
    vi.mocked(getNavigationSession).mockResolvedValue({
      ...session,
      activeOrganizationId: null,
    })
    const navigationSession = await loadNavigationSession(
      queryClient,
      options.href
    )
    const updatedAt = queryClient.getQueryState(
      navigationQueryKeys.session
    )?.dataUpdatedAt
    vi.setSystemTime(new Date("2030-01-01T00:00:20Z"))
    await loadWorkspaceViewer(
      { queryClient, navigationSession },
      "team",
      options
    )
    expect(
      queryClient.getQueryState(navigationQueryKeys.session)?.dataUpdatedAt
    ).toBe(updatedAt)
  })
})
