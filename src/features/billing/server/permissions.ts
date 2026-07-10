import "@tanstack/react-start/server-only"

import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getOrganizationRole } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"

type BillingPermissionInput = {
  organizationId?: string
  locationId?: string
  userId: string
}

async function requireWorkspaceBillingPermission(
  input: BillingPermissionInput
) {
  const organizationId =
    input.organizationId ?? (await getLocationOrganizationId(input.locationId))

  const role = organizationId
    ? await getOrganizationRole(organizationId, input.userId)
    : input.locationId
      ? await getLocationRole(input.locationId, input.userId)
      : null

  if (role !== "owner") {
    throw new Error("You do not have permission to manage billing.")
  }

  return role
}

async function getLocationOrganizationId(locationId: string | undefined) {
  if (!locationId) return null

  const result = await getDatabase().query<{ organization_id: string | null }>(
    `select organization_id
     from public.locations
     where id = $1
     limit 1`,
    [locationId]
  )

  return result.rows.at(0)?.organization_id ?? null
}

export { requireWorkspaceBillingPermission }
