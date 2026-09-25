import "@tanstack/react-start/server-only"

import type { WorkspaceViewerInput } from "@/features/navigation/schemas/navigation-schemas"
import type { WorkspaceViewer } from "@/features/navigation/types"
import type { WorkspaceSummary } from "@/features/onboarding/types"
import { getOrganizationBillingAccess } from "@/features/billing/server/billing-accounts"
import { getWorkspaceTrial } from "@/features/billing/server/trials"
import { readNavigationSession } from "@/features/navigation/server/navigation-session"
import { listOrganizationsForHeaders } from "@/features/onboarding/server/session"
import { getAuthRequestHeaders } from "@/lib/auth-session.server"
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

  const organizations = await listOrganizationsForHeaders(
    getAuthRequestHeaders()
  )
  const workspaces: Array<WorkspaceSummary> = organizations.map(
    (organization) => ({
      ...organization,
      type: "organization",
      organizationId: organization.id,
    })
  )
  const activeWorkspace = workspaces.find(
    (workspace) => workspace.slug === input.workspaceSlug
  )

  if (!activeWorkspace) return null

  const activeRole = await getOrganizationRole(
    activeWorkspace.id,
    session.user.id
  )

  if (!activeRole) return null

  const [trial, billing] = await Promise.all([
    getWorkspaceTrial({ organizationId: activeWorkspace.id }),
    getOrganizationBillingAccess(activeWorkspace.id),
  ])

  return {
    user: session.user,
    organizations,
    activeOrganization:
      organizations.find(
        (organization) => organization.id === activeWorkspace.id
      ) ?? null,
    activeWorkspace,
    activeRole,
    workspaces,
    trial,
    billing,
  }
}

export { readWorkspaceViewer }
