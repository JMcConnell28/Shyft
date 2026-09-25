import type { ViewerState } from "@/features/onboarding/types"
import type { OrganizationAppRouteKey } from "@/lib/organization-paths"
// eslint-disable-next-line no-duplicate-imports
import {
  getOrganizationAppPath,
  getOrganizationDashboardPath,
} from "@/lib/organization-paths"

type ViewerRouteState = Pick<
  ViewerState,
  "activeOrganization" | "activeWorkspace" | "onboarding"
>

type PendingOnboardingPath = "/onboarding/location" | "/onboarding/invite"

function getPendingOnboardingPath(
  viewer: ViewerRouteState
): PendingOnboardingPath | null {
  if (!viewer.activeOrganization) {
    return null
  }

  if (viewer.onboarding?.hasLocation === false) {
    return "/onboarding/location"
  }

  return null
}

function requireActiveOrganization(viewer: ViewerRouteState) {
  if (!viewer.activeOrganization) {
    throw new Error("An active organization is required for this route.")
  }

  return viewer.activeOrganization
}

function getExistingOrganizationRedirect(viewer: ViewerRouteState) {
  if (!viewer.activeOrganization) {
    return null
  }

  return (
    getPendingOnboardingPath(viewer) ??
    getOrganizationDashboardPath(viewer.activeOrganization.slug)
  )
}

function getOrganizationAppRedirect(
  viewer: ViewerRouteState,
  routeKey: OrganizationAppRouteKey
) {
  if (!viewer.activeOrganization) {
    return null
  }

  const pendingOnboardingPath = getPendingOnboardingPath(viewer)

  if (pendingOnboardingPath) {
    return pendingOnboardingPath
  }

  return getOrganizationAppPath(viewer.activeOrganization.slug, routeKey)
}

export {
  getExistingOrganizationRedirect,
  getOrganizationAppRedirect,
  getPendingOnboardingPath,
  requireActiveOrganization,
}
export type { PendingOnboardingPath }
