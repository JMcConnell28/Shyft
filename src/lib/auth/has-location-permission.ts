import type { OrganizationPermissionRequest } from "@/lib/auth/has-org-permission"
import { roles, type OrganizationRole } from "@/lib/auth/permissions"
import { getDatabase } from "@/lib/db"

type LocationRole = Extract<OrganizationRole, "owner" | "admin" | "manager" | "employee">

async function getLocationRole(
  locationId: string,
  userId: string,
): Promise<LocationRole | null> {
  const result = await getDatabase().query<{ role: string }>(
    `select role
     from public.location_memberships
     where location_id = $1
       and user_id = $2
     limit 1`,
    [locationId, userId],
  )
  const role = result.rows.at(0)?.role

  if (role !== "owner" && role !== "admin" && role !== "manager" && role !== "employee") {
    return null
  }

  return role
}

function hasLocationPermissionForRole(
  role: LocationRole | null,
  permissions: OrganizationPermissionRequest,
) {
  if (!role) {
    return false
  }

  return roles[role].authorize(permissions).success
}

async function requireLocationPermission({
  locationId,
  userId,
  permissions,
  errorMessage = "You do not have permission to perform that action.",
}: {
  locationId: string
  userId: string
  permissions: OrganizationPermissionRequest
  errorMessage?: string
}) {
  const role = await getLocationRole(locationId, userId)

  if (!hasLocationPermissionForRole(role, permissions)) {
    throw new Error(errorMessage)
  }

  return role
}

export {
  getLocationRole,
  hasLocationPermissionForRole,
  requireLocationPermission,
}
export type { LocationRole }
