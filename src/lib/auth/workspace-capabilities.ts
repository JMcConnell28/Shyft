import { roles } from "@/lib/auth/permissions"

type OrganizationRole = keyof typeof roles

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
  canManageTimeClock: boolean
  canManageSettings: boolean
  canManageLocations: boolean
  canInviteTeamMembers: boolean
  canManageTeamMembers: boolean
  canManageAnnouncements: boolean
}

function can(
  role: OrganizationRole | null,
  permissions: Parameters<(typeof roles)[OrganizationRole]["authorize"]>[0]
) {
  return role ? roles[role].authorize(permissions).success : false
}

function getOrgCapabilitiesForRole(
  role: OrganizationRole | null
): OrganizationCapabilities {
  const canViewOrganization = can(role, { organization: ["view"] })
  const canManageOrganization = can(role, { organization: ["update"] })
  const canViewRota = can(role, { rota: ["view"] })
  const canCreateRota = can(role, { rota: ["create"] })
  const canUpdateRota = can(role, { rota: ["update"] })
  const canPublishRota = can(role, { rota: ["publish"] })

  return {
    role,
    canViewOrganization,
    canManageOrganization,
    canViewRota,
    canCreateRota,
    canUpdateRota,
    canPublishRota,
    canManageRota: canCreateRota || canUpdateRota || canPublishRota,
    canViewRotaCosts: can(role, { rota: ["viewCosts"] }),
    canManageTimeClock: can(role, { shift: ["update"] }),
    canManageSettings: can(role, { location: ["update"] }),
    canManageLocations: can(role, { location: ["create"] }),
    canInviteTeamMembers: can(role, { invitation: ["create"] }),
    canManageTeamMembers: can(role, { member: ["create"] }),
    canManageAnnouncements: can(role, { announcement: ["create"] }),
  }
}

export { getOrgCapabilitiesForRole }
export type { OrganizationCapabilities }
