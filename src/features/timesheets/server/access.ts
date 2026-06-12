import { listAccessibleLocations } from "@/features/rota/server/access"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { assertCurrentUser } from "@/features/time-clock/server/shared"
import { getOrgCapabilitiesForRole } from "@/lib/auth/get-org-capabilities"
import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getOrganizationRole } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"

type TimesheetAccessScope = {
  canManage: boolean
  locationIds: string[]
  locations: Array<{
    id: string
    name: string
  }>
  organizationId: string | null
  userId: string
}

async function resolveTimesheetAccess(input: {
  organizationId?: string | null
  locationId?: string
  userId: string
}): Promise<TimesheetAccessScope> {
  const { session } = await requireVerifiedSessionOrThrow()
  assertCurrentUser(session.user.id, input.userId)

  if (input.locationId) {
    const role = await getLocationRole(input.locationId, session.user.id)
    const capabilities = getOrgCapabilitiesForRole(role)

    if (!capabilities.canViewRota) {
      return getEmptyScope(session.user.id, input.organizationId ?? null)
    }

    const location = await getLocation(input.locationId)

    return {
      canManage: capabilities.canManageRota,
      locationIds: [location.id],
      locations: [location],
      organizationId: input.organizationId ?? null,
      userId: session.user.id,
    }
  }

  if (!input.organizationId) {
    return getEmptyScope(session.user.id, null)
  }

  const role = await getOrganizationRole(input.organizationId, session.user.id)
  const capabilities = getOrgCapabilitiesForRole(role)
  const locations = await listAccessibleLocations(
    input.organizationId,
    session.user.id,
    role,
  )

  return {
    canManage: capabilities.canManageRota,
    locationIds: locations.map((location) => location.id),
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
    })),
    organizationId: input.organizationId,
    userId: session.user.id,
  }
}

async function getLocation(locationId: string) {
  const result = await getDatabase().query<{
    id: string
    name: string
  }>(
    `select id, name
     from public.locations
     where id = $1::uuid
     limit 1`,
    [locationId],
  )
  const location = result.rows[0]

  if (!location) {
    throw new Error("Choose a valid location.")
  }

  return location
}

function getEmptyScope(
  userId: string,
  organizationId: string | null,
): TimesheetAccessScope {
  return {
    canManage: false,
    locationIds: [],
    locations: [],
    organizationId,
    userId,
  }
}

export { resolveTimesheetAccess }
export type { TimesheetAccessScope }
