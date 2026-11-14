import { QueryClient } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router"
import { describe, expect, it, vi } from "vitest"

import type {
  NavigationSession,
  WorkspaceViewer,
} from "@/features/navigation/types"
import { getOrgCapabilitiesForRole } from "@/lib/auth/workspace-capabilities"
import { Route as DashboardRoute } from "@/routes/_authed/_verified/app/$workspaceSlug/dashboard"
import { Route as ManageRoute } from "@/routes/_authed/_verified/app/$workspaceSlug/manage"

vi.mock("./load-dashboard", () => ({ loadDashboard: vi.fn() }))
vi.mock("@/features/navigation/components/workspace-route-pending", () => ({
  WorkspaceRoutePending: () => null,
}))

const workspace = {
  id: "org-a",
  name: "Team",
  slug: "team",
  type: "organization",
  organizationId: "org-a",
} as const
const navigationSession: NavigationSession = {
  sessionId: "session-a",
  expiresAt: Date.parse("2030-01-02"),
  activeOrganizationId: workspace.id,
  user: {
    id: "user-a",
    name: "Alex",
    email: "alex@example.com",
    emailVerified: true,
  },
}
const filterSearch = {
  location: "f64d43d7-c0e7-4393-892a-383b13430298",
  date: "2026-10-18",
}

function beforeLoadInput(role: WorkspaceViewer["activeRole"]) {
  const router = createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory(),
  })
  const viewer: WorkspaceViewer = {
    user: navigationSession.user,
    organizations: [workspace],
    activeOrganization: workspace,
    activeWorkspace: workspace,
    activeRole: role,
    workspaces: [workspace],
    trial: null,
    billing: null,
    shiftSwapsEnabled: false,
  }

  return {
    context: {
      queryClient: new QueryClient(),
      navigationSession,
      capabilities: getOrgCapabilitiesForRole(role),
      viewer,
    },
    params: { workspaceSlug: workspace.slug },
    abortController: new AbortController(),
    buildLocation: () => router.state.location,
    navigate: () => Promise.resolve(),
    location: router.state.location,
    matches: [],
    preload: false,
    cause: "enter" as const,
  }
}

function openDashboard(role: WorkspaceViewer["activeRole"], search = {}) {
  const { beforeLoad, validateSearch } = DashboardRoute.options
  if (!beforeLoad || typeof validateSearch !== "function") {
    throw new Error("Expected Dashboard route guards and search validation.")
  }
  return beforeLoad({
    ...beforeLoadInput(role),
    routeId: "/_authed/_verified/app/$workspaceSlug/dashboard",
    search: validateSearch(search),
  })
}

function openManage(role: WorkspaceViewer["activeRole"]) {
  const { beforeLoad, validateSearch } = ManageRoute.options
  if (!beforeLoad || typeof validateSearch !== "function") {
    throw new Error("Expected Manage route guards and search validation.")
  }
  return beforeLoad({
    ...beforeLoadInput(role),
    routeId: "/_authed/_verified/app/$workspaceSlug/manage",
    search: validateSearch(filterSearch),
  })
}

describe("workspace dashboard routes", () => {
  it.each(["owner", "admin", "manager", "supervisor"] as const)(
    "lets a %s open both standalone pages",
    (role) => {
      expect(() => openDashboard(role)).not.toThrow()
      expect(() => openManage(role)).not.toThrow()
    }
  )

  it("redirects an old manager bookmark with its location and date", () => {
    expect(() =>
      openDashboard("manager", { view: "manager", ...filterSearch })
    ).toThrow(
      expect.objectContaining({
        options: expect.objectContaining({
          to: "/app/$workspaceSlug/manage",
          params: { workspaceSlug: "team" },
          search: filterSearch,
          replace: true,
        }),
      })
    )
  })

  it("keeps employees on Dashboard and redirects direct Manage visits", () => {
    expect(() => openDashboard("employee", { view: "manager" })).not.toThrow()
    expect(() => openManage("employee")).toThrow(
      expect.objectContaining({
        options: expect.objectContaining({
          to: "/app/$workspaceSlug/dashboard",
          params: { workspaceSlug: "team" },
          replace: true,
        }),
      })
    )
  })
})
