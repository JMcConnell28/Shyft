import type { AccessibleRotaLocation } from "@/features/rota/types"
import {
  getOrgCapabilitiesForRole,
  type OrganizationCapabilities,
} from "@/lib/auth/get-org-capabilities"
import { createSupabaseServerClient } from "@/lib/supabase"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

import {
  getSeenPublishedVersionsMap,
  listPublishedRotasForLocations,
} from "@/features/rota/server/related-data"
import { getMembershipRole } from "@/features/rota/server/membership"

async function listAccessibleLocations(
  organizationId: string,
  userId: string,
  role?: Awaited<ReturnType<typeof getMembershipRole>>,
): Promise<Array<AccessibleRotaLocation>> {
  const supabase = createSupabaseServerClient()
  const resolvedRole =
    role ?? (await getMembershipRole(organizationId, userId))
  const capabilities = getOrgCapabilitiesForRole(resolvedRole)

  if (!resolvedRole || !capabilities.canViewRota) {
    return []
  }

  const baseLocations =
    capabilities.canManageRota
      ? await listManagerAccessibleLocations(supabase, organizationId)
      : await listEmployeeAccessibleLocations(supabase, organizationId, userId)

  if (baseLocations.length === 0) {
    return []
  }

  const publishedRotas = await listPublishedRotasForLocations(
    organizationId,
    baseLocations.map((location) => location.id),
  )
  const seenVersions = await getSeenPublishedVersionsMap(
    publishedRotas.map((rota) => rota.id),
    userId,
  )
  const unreadLocationIds = new Set(
    publishedRotas
      .filter((rota) => {
        return (
          rota.published_version > (seenVersions.get(rota.id) ?? 0) &&
          rota.published_by_user_id !== userId
        )
      })
      .map((rota) => rota.location_id),
  )

  return baseLocations.map((location) => ({
    ...location,
    hasUnreadPublished: unreadLocationIds.has(location.id),
  }))
}

async function ensureLocationAccessOrThrow(
  organizationId: string,
  userId: string,
  locationId: string,
  role?: Awaited<ReturnType<typeof getMembershipRole>>,
) {
  const locations = await listAccessibleLocations(organizationId, userId, role)
  const location = locations.find((item) => item.id === locationId) ?? null

  if (!location) {
    throw new Error("You do not have access to that location.")
  }

  return {
    location,
    locations,
  }
}

async function getHasUnreadRotaUpdates({
  organizationId,
  userId,
  capabilities,
}: {
  organizationId: string
  userId: string
  capabilities?: OrganizationCapabilities
}) {
  if (capabilities && !capabilities.canViewRota) {
    return false
  }

  const locations = await listAccessibleLocations(organizationId, userId)
  return locations.some((location) => location.hasUnreadPublished)
}

export {
  ensureLocationAccessOrThrow,
  getHasUnreadRotaUpdates,
  listAccessibleLocations,
}

async function listEmployeeAccessibleLocations(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  organizationId: string,
  userId: string,
): Promise<Array<Omit<AccessibleRotaLocation, "hasUnreadPublished">>> {
  const employeeResult = await supabase
    .from("employees")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()

  assertSupabaseSuccess(
    employeeResult.error,
    "We could not load your employee profile.",
  )

  if (!employeeResult.data) {
    return []
  }

  const assignmentResult = await supabase
    .from("employee_location_assignments")
    .select("location_id")
    .eq("organization_id", organizationId)
    .eq("employee_id", employeeResult.data.id)
    .eq("is_enabled", true)
    .is("disabled_at", null)

  assertSupabaseSuccess(
    assignmentResult.error,
    "We could not load your workplace assignments.",
  )

  const locationIds = (assignmentResult.data ?? []).map(
    (assignment) => assignment.location_id,
  )

  if (locationIds.length === 0) {
    return []
  }

  const locationResult = await supabase
    .from("locations")
    .select("id, name, slug")
    .eq("organization_id", organizationId)
    .in("id", locationIds)
    .order("name", { ascending: true })

  assertSupabaseSuccess(locationResult.error, "We could not load locations.")

  return (locationResult.data ?? []).map((location) => ({
    id: location.id,
    name: location.name,
    slug: location.slug,
  }))
}

async function listManagerAccessibleLocations(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  organizationId: string,
): Promise<Array<Omit<AccessibleRotaLocation, "hasUnreadPublished">>> {
  const result = await supabase
    .from("locations")
    .select("id, name, slug")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true })
    .order("name", { ascending: true })

  assertSupabaseSuccess(result.error, "We could not load locations.")

  return (result.data ?? []).map((location) => ({
    id: location.id,
    name: location.name,
    slug: location.slug,
  }))
}

