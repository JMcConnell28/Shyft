import type { OrganizationRole } from "@/lib/auth/permissions"
import {
  getOrganizationRole,
  hasOrgPermissionForRole,
} from "@/lib/auth/has-org-permission"

type OrganizationCapabilities = {
  role: OrganizationRole | null
  canViewOrganization: boolean
  canManageOrganization: boolean
  canViewRota: boolean
  canCreateRota: boolean
  canUpdateRota: boolean
  canPublishRota: boolean
  canManageRota: boolean
  canViewRotaCosts: boolean
  canManageLocations: boolean
  canInviteTeamMembers: boolean
  canManageTeamMembers: boolean
}

function getOrgCapabilitiesForRole(
  role: OrganizationRole | null,
): OrganizationCapabilities {
  const canViewOrganization = hasOrgPermissionForRole(role, {
    organization: ["view"],
  })
  const canManageOrganization = hasOrgPermissionForRole(role, {
    organization: ["update"],
  })
  const canViewRota = hasOrgPermissionForRole(role, {
    rota: ["view"],
  })
  const canCreateRota = hasOrgPermissionForRole(role, {
    rota: ["create"],
  })
  const canUpdateRota = hasOrgPermissionForRole(role, {
    rota: ["update"],
  })
  const canPublishRota = hasOrgPermissionForRole(role, {
    rota: ["publish"],
  })
  const canViewRotaCosts = hasOrgPermissionForRole(role, {
    rota: ["viewCosts"],
  })
  const canManageLocations = hasOrgPermissionForRole(role, {
    location: ["create"],
  })
  const canInviteTeamMembers = hasOrgPermissionForRole(role, {
    invitation: ["create"],
  })
  const canManageTeamMembers = hasOrgPermissionForRole(role, {
    member: ["create"],
  })

  return {
    role,
    canViewOrganization,
    canManageOrganization,
    canViewRota,
    canCreateRota,
    canUpdateRota,
    canPublishRota,
    canManageRota: canCreateRota || canUpdateRota || canPublishRota,
    canViewRotaCosts,
    canManageLocations,
    canInviteTeamMembers,
    canManageTeamMembers,
  }
}

async function getOrgCapabilities({
  organizationId,
  userId,
}: {
  organizationId: string
  userId: string
}) {
  const role = await getOrganizationRole(organizationId, userId)

  return getOrgCapabilitiesForRole(role)
}

export { getOrgCapabilities, getOrgCapabilitiesForRole }
export type { OrganizationCapabilities }
