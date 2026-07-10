import type { WorkspaceSummary } from "@/features/onboarding/types"
import {
  getWorkspaceDashboardPath,
  getWorkspaceRotaPath,
  type OrganizationAppRouteKey,
} from "@/lib/organization-paths"

type WorkspaceShellBackLink = {
  href: string
  label: string
}

type WorkspaceShellConfig = {
  routeKey: OrganizationAppRouteKey
  title: string
  description: string
  backLink?: WorkspaceShellBackLink
}

function getWorkspaceShellConfig(
  pathname: string,
  workspace: WorkspaceSummary,
) {
  const workspaceBasePath = `/w/${workspace.slug}`
  const workspacePath = pathname.startsWith(workspaceBasePath)
    ? pathname.slice(workspaceBasePath.length)
    : pathname

  if (isRotaDetailPath(workspacePath, workspace.type)) {
    return {
      routeKey: "rota",
      title: "Rota",
      description: "Create, review, and publish the selected weekly rota.",
      backLink: {
        href: getWorkspaceRotaPath(workspace.slug),
        label: "Back to rotas",
      },
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/rota")) {
    return {
      routeKey: "rota",
      title: "Rota",
      description:
        workspace.type === "organization"
          ? "Review weekly rotas across venues and jump into the builder."
          : "Review weekly rotas and jump into the builder.",
      backLink: {
        href: getWorkspaceDashboardPath(workspace.slug),
        label: "Back to dashboard",
      },
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/settings")) {
    return {
      routeKey: "settings",
      title: "Settings",
      description: "Manage workspace settings and team setup.",
      backLink: {
        href: getWorkspaceDashboardPath(workspace.slug),
        label: "Back to dashboard",
      },
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/announcements")) {
    return {
      routeKey: "announcements",
      title: "Announcements",
      description: "Read and share team updates.",
      backLink: {
        href: getWorkspaceDashboardPath(workspace.slug),
        label: "Back to dashboard",
      },
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/shift-swaps")) {
    return {
      routeKey: "shiftSwaps",
      title: "Shift swaps",
      description: "Request swaps, offer cover, and review approvals.",
      backLink: {
        href: getWorkspaceDashboardPath(workspace.slug),
        label: "Back to dashboard",
      },
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/time-clock")) {
    return {
      routeKey: "timeClock",
      title: "Time clock",
      description: "Monitor clock-ins, failed attempts, and manager overrides.",
      backLink: {
        href: getWorkspaceDashboardPath(workspace.slug),
        label: "Back to dashboard",
      },
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/timesheets")) {
    return {
      routeKey: "timesheets",
      title: "Timesheets",
      description: "Review weekly worked, scheduled, and payable hours.",
      backLink: {
        href: getWorkspaceDashboardPath(workspace.slug),
        label: "Back to dashboard",
      },
    } satisfies WorkspaceShellConfig
  }

  if (workspacePath.startsWith("/account")) {
    return {
      routeKey: "dashboard",
      title: "Account",
      description: "Manage your personal details and password.",
      backLink: {
        href: getWorkspaceDashboardPath(workspace.slug),
        label: "Back to dashboard",
      },
    } satisfies WorkspaceShellConfig
  }

  return {
    routeKey: "dashboard",
    title: "Dashboard",
    description:
      "Your workspace is ready. Add staff and move into rota planning.",
  } satisfies WorkspaceShellConfig
}

function isRotaDetailPath(path: string, workspaceType: WorkspaceSummary["type"]) {
  if (workspaceType === "organization") {
    return /^\/rota\/[^/]+\/[^/]+(?:\/view)?$/.test(path)
  }

  return /^\/rota\/[^/]+(?:\/view)?$/.test(path)
}

export { getWorkspaceShellConfig }
export type { WorkspaceShellConfig }
