import type { OrganizationAppRouteKey } from "@/lib/organization-paths"

type OrgWorkspaceShellConfig = {
  routeKey: OrganizationAppRouteKey
  title: string
  description: string
}

function getOrgWorkspaceShellConfig(pathname: string, orgSlug: string) {
  const orgBasePath = `/o/${orgSlug}`
  const workspacePath = pathname.startsWith(orgBasePath)
    ? pathname.slice(orgBasePath.length)
    : pathname

  if (/^\/rota\/[^/]+\/[^/]+$/.test(workspacePath)) {
    return {
      routeKey: "rota",
      title: "Rota",
      description: "Create, review, and publish the selected weekly rota.",
    } satisfies OrgWorkspaceShellConfig
  }

  if (workspacePath.startsWith("/rota")) {
    return {
      routeKey: "rota",
      title: "Rota",
      description: "Review weekly rotas across venues and jump into the builder.",
    } satisfies OrgWorkspaceShellConfig
  }

  return {
    routeKey: "dashboard",
    title: "Dashboard",
    description:
      "Your active workspace is ready. Add staff, refine locations, and move into rota planning.",
  } satisfies OrgWorkspaceShellConfig
}

export { getOrgWorkspaceShellConfig }
export type { OrgWorkspaceShellConfig }
