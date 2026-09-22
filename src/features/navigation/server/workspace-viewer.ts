import "@tanstack/react-start/server-only"

import type { WorkspaceViewerInput } from "@/features/navigation/schemas/navigation-schemas"
import type { WorkspaceViewer } from "@/features/navigation/types"
import type { WorkspaceSummary } from "@/features/onboarding/types"
import {
  getLocationBillingAccess,
  getOrganizationBillingAccess,
} from "@/features/billing/server/billing-accounts"
import { getWorkspaceTrial } from "@/features/billing/server/trials"
import { readNavigationSession } from "@/features/navigation/server/navigation-session"
import {
  listLocationWorkspacesForUser,
  listOrganizationsForHeaders,
} from "@/features/onboarding/server/session"
import { getAuthRequestHeaders } from "@/lib/auth-session.server"
import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getOrganizationRole } from "@/lib/auth/has-org-permission"

async function readWorkspaceViewer(
  input: WorkspaceViewerInput
): Promise<WorkspaceViewer | null> {
  const session = await readNavigationSession()

  if (
    !session?.user.emailVerified ||
    session.user.id !== input.userId ||
    session.sessionId !== input.sessionId
  ) {
    return null
  }

  const [organizations, locationWorkspaces] = await Promise.all([
    listOrganizationsForHeaders(getAuthRequestHeaders()),
    listLocationWorkspacesForUser(session.user.id),
  ])
  const organizationWorkspaces: Array<WorkspaceSummary> = organizations.map(
    (organization) => ({
      ...organization,
      type: "organization",
      organizationId: organization.id,
    })
  )
  const workspaces = [...locationWorkspaces, ...organizationWorkspaces]
  // Resolve once from authorized memberships, preserving location precedence.
  const activeWorkspace = workspaces.find(
    (workspace) => workspace.slug === input.workspaceSlug
  )

  if (!activeWorkspace) return null

  const isOrganization = activeWorkspace.type === "organization"
  const activeRole = await (isOrganization
    ? getOrganizationRole(activeWorkspace.id, session.user.id)
    : getLocationRole(activeWorkspace.id, session.user.id))

  if (!activeRole) return null

  const [trial, billing] = await Promise.all([
    getWorkspaceTrial(
      isOrganization
        ? { organizationId: activeWorkspace.id }
        : { locationId: activeWorkspace.id }
    ),
    isOrganization
      ? getOrganizationBillingAccess(activeWorkspace.id)
      : getLocationBillingAccess(activeWorkspace.id),
  ])

  return {
    user: session.user,
    organizations,
    activeOrganization: isOrganization
      ? (organizations.find(
          (organization) => organization.id === activeWorkspace.id
        ) ?? null)
      : null,
    activeWorkspace,
    activeRole,
    workspaces,
    trial,
    billing,
  }
}

export { readWorkspaceViewer }
