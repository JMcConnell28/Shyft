type OrganizationAppRouteKey =
  | "dashboard"
  | "rota"
  | "settings"
  | "timeClock"
  | "timesheets"
type LocationAppRouteKey = OrganizationAppRouteKey

function getWorkspaceBasePath(workspaceSlug: string) {
  return `/w/${workspaceSlug}`
}

function getWorkspaceDashboardPath(workspaceSlug: string) {
  return `${getWorkspaceBasePath(workspaceSlug)}/dashboard`
}

function getWorkspaceRotaPath(workspaceSlug: string) {
  return `${getWorkspaceBasePath(workspaceSlug)}/rota`
}

function getWorkspaceTimeClockPath(workspaceSlug: string) {
  return `${getWorkspaceBasePath(workspaceSlug)}/time-clock`
}

function getWorkspaceTimesheetsPath(workspaceSlug: string) {
  return `${getWorkspaceBasePath(workspaceSlug)}/timesheets`
}

function getWorkspaceSettingsPath(workspaceSlug: string) {
  return `${getWorkspaceBasePath(workspaceSlug)}/settings`
}

function getWorkspaceAccountPath(workspaceSlug: string) {
  return `${getWorkspaceBasePath(workspaceSlug)}/account`
}

function getWorkspaceAppPath(
  workspaceSlug: string,
  routeKey: OrganizationAppRouteKey,
) {
  if (routeKey === "rota") {
    return getWorkspaceRotaPath(workspaceSlug)
  }

  if (routeKey === "settings") {
    return getWorkspaceSettingsPath(workspaceSlug)
  }

  if (routeKey === "timeClock") {
    return getWorkspaceTimeClockPath(workspaceSlug)
  }

  if (routeKey === "timesheets") {
    return getWorkspaceTimesheetsPath(workspaceSlug)
  }

  return getWorkspaceDashboardPath(workspaceSlug)
}

function getOrganizationBasePath(orgSlug: string) {
  return getWorkspaceBasePath(orgSlug)
}

function getOrganizationDashboardPath(orgSlug: string) {
  return `${getOrganizationBasePath(orgSlug)}/dashboard`
}

function getOrganizationRotaPath(orgSlug: string) {
  return `${getOrganizationBasePath(orgSlug)}/rota`
}

function getOrganizationSettingsPath(orgSlug: string) {
  return `${getOrganizationBasePath(orgSlug)}/settings`
}

function getOrganizationTimeClockPath(orgSlug: string) {
  return `${getOrganizationBasePath(orgSlug)}/time-clock`
}

function getOrganizationTimesheetsPath(orgSlug: string) {
  return `${getOrganizationBasePath(orgSlug)}/timesheets`
}

function getLocationBasePath(locationSlug: string) {
  return getWorkspaceBasePath(locationSlug)
}

function getLocationDashboardPath(locationSlug: string) {
  return `${getLocationBasePath(locationSlug)}/dashboard`
}

function getLocationRotaPath(locationSlug: string) {
  return `${getLocationBasePath(locationSlug)}/rota`
}

function getLocationSettingsPath(locationSlug: string) {
  return `${getLocationBasePath(locationSlug)}/settings`
}

function getLocationTimeClockPath(locationSlug: string) {
  return `${getLocationBasePath(locationSlug)}/time-clock`
}

function getLocationTimesheetsPath(locationSlug: string) {
  return `${getLocationBasePath(locationSlug)}/timesheets`
}

function getOrganizationAppPath(
  orgSlug: string,
  routeKey: OrganizationAppRouteKey
) {
  if (routeKey === "rota") {
    return getOrganizationRotaPath(orgSlug)
  }

  if (routeKey === "settings") {
    return getOrganizationSettingsPath(orgSlug)
  }

  if (routeKey === "timeClock") {
    return getOrganizationTimeClockPath(orgSlug)
  }

  if (routeKey === "timesheets") {
    return getOrganizationTimesheetsPath(orgSlug)
  }

  return getOrganizationDashboardPath(orgSlug)
}

export type { OrganizationAppRouteKey }
export {
  getLocationAppPath,
  getLocationBasePath,
  getLocationDashboardPath,
  getLocationRotaPath,
  getLocationSettingsPath,
  getLocationTimesheetsPath,
  getLocationTimeClockPath,
  getWorkspaceAccountPath,
  getWorkspaceAppPath,
  getWorkspaceBasePath,
  getWorkspaceDashboardPath,
  getWorkspaceRotaPath,
  getWorkspaceSettingsPath,
  getWorkspaceTimesheetsPath,
  getWorkspaceTimeClockPath,
  getOrganizationAppPath,
  getOrganizationBasePath,
  getOrganizationDashboardPath,
  getOrganizationRotaPath,
  getOrganizationSettingsPath,
  getOrganizationTimesheetsPath,
  getOrganizationTimeClockPath,
}

function getLocationAppPath(
  locationSlug: string,
  routeKey: LocationAppRouteKey,
) {
  if (routeKey === "rota") {
    return getLocationRotaPath(locationSlug)
  }

  if (routeKey === "settings") {
    return getLocationSettingsPath(locationSlug)
  }

  if (routeKey === "timeClock") {
    return getLocationTimeClockPath(locationSlug)
  }

  if (routeKey === "timesheets") {
    return getLocationTimesheetsPath(locationSlug)
  }

  return getLocationDashboardPath(locationSlug)
}
