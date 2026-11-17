import type { WorkspaceSummary } from "@/features/onboarding/types"
import {
  // eslint-disable-next-line import/consistent-type-specifier-style
  type OrganizationAppRouteKey,
  getWorkspaceRotaPath,
} from "@/lib/organization-paths"

type WorkspaceShellConfig = {
  routeKey: OrganizationAppRouteKey
  title: string
  description: string
  back?: { fallbackHref?: string }
  mobileBrandHeader?: boolean
}

function getWorkspaceShellConfig(
  pathname: string,
  workspace: WorkspaceSummary
): WorkspaceShellConfig {
  const workspaceBasePath = `/app/${workspace.slug}`
  const workspacePath = pathname.startsWith(workspaceBasePath)
    ? pathname.slice(workspaceBasePath.length)
    : pathname

  if (workspacePath === "/manage" || workspacePath === "/manage/") {
    return {
      routeKey: "manage",
      title: "Manage",
      description: "Review staffing, attendance, and upcoming rotas.",
      mobileBrandHeader: true,
    }
  }

  if (isRotaDetailPath(workspacePath)) {
    return {
      routeKey: "rota",
      title: "Rota",
      description: "Create, review, and publish the selected weekly rota.",
      back: { fallbackHref: getWorkspaceRotaPath(workspace.slug) },
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/rota")) {
    return {
      routeKey: "rota",
      title: "Rota",
      description:
        "Review weekly rotas across venues and jump into the builder.",
      back: {},
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/settings")) {
    return {
      routeKey: "settings",
      title: "Settings",
      description: "Manage workspace settings and team setup.",
      back: {},
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/support")) {
    return {
      routeKey: "support",
      title: "Support",
      description: "Your conversations with RocketRota support.",
      back: {},
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/announcements")) {
    return {
      routeKey: "announcements",
      title: "Announcements",
      description: "Read and share team updates.",
      back: {},
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/shift-swaps")) {
    return {
      routeKey: "shiftSwaps",
      title: "Shift swaps",
      description: "Request swaps, offer cover, and review approvals.",
      back: {},
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/time-clock")) {
    return {
      routeKey: "timeClock",
      title: "Time tracking",
      description: "Monitor clock-ins, failed attempts, and manager overrides.",
      back: {},
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/timesheets")) {
    return {
      routeKey: "timesheets",
      title: "Timesheets",
      description: "Review weekly worked, scheduled, and payable hours.",
      back: {},
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/account")) {
    return {
      routeKey: "dashboard",
      mobileBrandHeader: true,
      title: "Account",
      description: "Manage your personal details and password.",
      back: {},
    } satisfies WorkspaceShellConfig
  }

  return {
    routeKey: "dashboard",
    title: "Dashboard",
    description:
      "Your workspace is ready. Add staff and move into rota planning.",
  } satisfies WorkspaceShellConfig
}

function isRotaDetailPath(path: string) {
  return /^\/rota\/[^/]+\/[^/]+(?:\/view)?$/.test(path)
}

export { getWorkspaceShellConfig }
export type { WorkspaceShellConfig }
