type OrganizationAppRouteKey = "dashboard" | "rota"

function getOrganizationBasePath(orgSlug: string) {
  return `/o/${orgSlug}`
}

function getOrganizationDashboardPath(orgSlug: string) {
  return `${getOrganizationBasePath(orgSlug)}/dashboard`
}

function getOrganizationRotaPath(orgSlug: string) {
  return `${getOrganizationBasePath(orgSlug)}/rota`
}

function getOrganizationAppPath(
  orgSlug: string,
  routeKey: OrganizationAppRouteKey
) {
  if (routeKey === "rota") {
    return getOrganizationRotaPath(orgSlug)
  }

  return getOrganizationDashboardPath(orgSlug)
}

export type { OrganizationAppRouteKey }
export {
  getOrganizationAppPath,
  getOrganizationBasePath,
  getOrganizationDashboardPath,
  getOrganizationRotaPath,
}
