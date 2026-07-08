import type { AccessibleRotaLocation } from "@/features/rota/types"
import {
  getOrgCapabilitiesForRole,
  type OrganizationCapabilities,
} from "@/lib/auth/get-org-capabilities"
import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getDatabase } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

import {
  getSeenPublishedVersionsMap,
  listPublishedRotasForLocations,
} from "@/features/rota/server/related-data"
import { getMembershipRole } from "@/features/rota/server/membership"

async function listAccessibleLocations(
  organizationId: string | null,
  userId: string,
  role?: Awaited<ReturnType<typeof getMembershipRole>>,
  locationId?: string
): Promise<Array<AccessibleRotaLocation>> {
  const supabase = createSupabaseServerClient()
  const resolvedRole =
    role ??
    (locationId
      ? await getLocationRole(locationId, userId)
      : organizationId
        ? await getMembershipRole(organizationId, userId)
        : null)
  const capabilities = getOrgCapabilitiesForRole(resolvedRole)

  if (!resolvedRole || !capabilities.canViewRota) {
    return []
  }

  if (locationId) {
    return listLocationWorkspaceAccess({
      capabilities,
      locationId,
      organizationId,
      supabase,
      userId,
    })
  }

  const canViewManagedLocations =
    capabilities.canManageRota || capabilities.canManageTimeClock
  const baseLocations = canViewManagedLocations
    ? await listManagerAccessibleLocations(supabase, organizationId, userId)
    : await listEmployeeAccessibleLocations(supabase, organizationId, userId)

  if (baseLocations.length === 0) {
    return []
  }

  const publishedRotas = await listPublishedRotasForLocations(
    organizationId,
    baseLocations.map((location) => location.id)
  )
  const seenVersions = await getSeenPublishedVersionsMap(
    publishedRotas.map((rota) => rota.id),
    userId
  )
  const unreadLocationIds = new Set(
    publishedRotas
      .filter((rota) => {
        return (
          rota.published_version > (seenVersions.get(rota.id) ?? 0) &&
          rota.published_by_user_id !== userId
        )
      })
      .map((rota) => rota.location_id)
  )

  return baseLocations.map((location) => ({
    ...location,
    hasUnreadPublished: unreadLocationIds.has(location.id),
  }))
}

async function ensureLocationAccessOrThrow(
  organizationId: string | null,
  userId: string,
  locationId: string,
  role?: Awaited<ReturnType<typeof getMembershipRole>>
) {
  const locations = await listAccessibleLocations(
    organizationId,
    userId,
    role,
    locationId
  )
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
  locationId,
  userId,
  capabilities,
}: {
  organizationId?: string | null
  locationId?: string
  userId: string
  capabilities?: OrganizationCapabilities
}) {
  if (capabilities && !capabilities.canViewRota) {
    return false
  }

  if (locationId) {
    const role = await getLocationRole(locationId, userId)
    const locationCapabilities = getOrgCapabilitiesForRole(role)

    if (capabilities && !capabilities.canViewRota) {
      return false
    }

    if (!locationCapabilities.canViewRota) {
      return false
    }

    const publishedRotas = await listPublishedRotasForLocations(null, [
      locationId,
    ])
    const seenVersions = await getSeenPublishedVersionsMap(
      publishedRotas.map((rota) => rota.id),
      userId
    )

    return publishedRotas.some((rota) => {
      return (
        rota.published_version > (seenVersions.get(rota.id) ?? 0) &&
        rota.published_by_user_id !== userId
      )
    })
  }

  if (!organizationId) {
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
  organizationId: string | null,
  userId: string
): Promise<Array<Omit<AccessibleRotaLocation, "hasUnreadPublished">>> {
  const employeeQuery = supabase
    .from("employees")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")

  const scopedEmployeeResult = await (
    organizationId
      ? employeeQuery.eq("organization_id", organizationId)
      : employeeQuery.is("organization_id", null)
  ).maybeSingle()

  assertSupabaseSuccess(
    scopedEmployeeResult.error,
    "We could not load your employee profile."
  )

  if (!scopedEmployeeResult.data) {
    return []
  }

  const assignmentResult = await supabase
    .from("employee_location_assignments")
    .select("location_id")
    .eq("employee_id", scopedEmployeeResult.data.id)
    .eq("is_enabled", true)
    .is("disabled_at", null)

  assertSupabaseSuccess(
    assignmentResult.error,
    "We could not load your workplace assignments."
  )

  const locationIds = (assignmentResult.data ?? []).map(
    (assignment) => assignment.location_id
  )

  if (locationIds.length === 0) {
    return []
  }

  const locationQuery = supabase
    .from("locations")
    .select("id, name, slug")
    .in("id", locationIds)
    .order("name", { ascending: true })
  const locationResult = await (organizationId
    ? locationQuery.eq("organization_id", organizationId)
    : locationQuery.is("organization_id", null))

  assertSupabaseSuccess(locationResult.error, "We could not load locations.")

  return (locationResult.data ?? []).map((location) => ({
    id: location.id,
    name: location.name,
    slug: location.slug,
  }))
}

async function listManagerAccessibleLocations(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  organizationId: string | null,
  userId: string
): Promise<Array<Omit<AccessibleRotaLocation, "hasUnreadPublished">>> {
  const query = supabase
    .from("locations")
    .select("id, name, slug")
    .order("created_at", { ascending: true })
    .order("name", { ascending: true })

  const result = organizationId
    ? await query.eq("organization_id", organizationId)
    : await query
        .is("organization_id", null)
        .in("id", await listLocationMembershipIds(userId))

  assertSupabaseSuccess(result.error, "We could not load locations.")

  return (result.data ?? []).map((location) => ({
    id: location.id,
    name: location.name,
    slug: location.slug,
  }))
}

async function listLocationWorkspaceAccess({
  capabilities,
  locationId,
  organizationId,
  supabase,
  userId,
}: {
  capabilities: OrganizationCapabilities
  locationId: string
  organizationId: string | null
  supabase: ReturnType<typeof createSupabaseServerClient>
  userId: string
}): Promise<Array<AccessibleRotaLocation>> {
  const canViewManagedLocations =
    capabilities.canManageRota || capabilities.canManageTimeClock
  const baseLocations = canViewManagedLocations
    ? await listLocationById(supabase, locationId, organizationId)
    : await listEmployeeAccessibleLocationById({
        locationId,
        organizationId,
        supabase,
        userId,
      })

  if (baseLocations.length === 0) {
    return []
  }

  const publishedRotas = await listPublishedRotasForLocations(organizationId, [
    locationId,
  ])
  const seenVersions = await getSeenPublishedVersionsMap(
    publishedRotas.map((rota) => rota.id),
    userId
  )
  const hasUnreadPublished = publishedRotas.some((rota) => {
    return (
      rota.published_version > (seenVersions.get(rota.id) ?? 0) &&
      rota.published_by_user_id !== userId
    )
  })

  return baseLocations.map((location) => ({
    ...location,
    hasUnreadPublished,
  }))
}

async function listLocationById(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  locationId: string,
  organizationId: string | null
): Promise<Array<Omit<AccessibleRotaLocation, "hasUnreadPublished">>> {
  const query = supabase
    .from("locations")
    .select("id, name, slug")
    .eq("id", locationId)

  const result = await (organizationId
    ? query.eq("organization_id", organizationId)
    : query)

  assertSupabaseSuccess(result.error, "We could not load locations.")

  return (result.data ?? []).map((location) => ({
    id: location.id,
    name: location.name,
    slug: location.slug,
  }))
}

async function listEmployeeAccessibleLocationById({
  locationId,
  organizationId,
  supabase,
  userId,
}: {
  locationId: string
  organizationId: string | null
  supabase: ReturnType<typeof createSupabaseServerClient>
  userId: string
}): Promise<Array<Omit<AccessibleRotaLocation, "hasUnreadPublished">>> {
  const employeeQuery = supabase
    .from("employees")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")

  const employeeResult = await (organizationId
    ? employeeQuery.eq("organization_id", organizationId)
    : employeeQuery)

  assertSupabaseSuccess(
    employeeResult.error,
    "We could not load your employee profile."
  )

  const employeeIds = (employeeResult.data ?? []).map((employee) => employee.id)

  if (employeeIds.length === 0) {
    return []
  }

  const assignmentResult = await supabase
    .from("employee_location_assignments")
    .select("location_id")
    .eq("location_id", locationId)
    .in("employee_id", employeeIds)
    .eq("is_enabled", true)
    .is("disabled_at", null)

  assertSupabaseSuccess(
    assignmentResult.error,
    "We could not load your workplace assignments."
  )

  if ((assignmentResult.data ?? []).length === 0) {
    return []
  }

  return listLocationById(supabase, locationId, organizationId)
}

async function listLocationMembershipIds(userId: string) {
  const result = await getDatabase().query<{ location_id: string }>(
    `select location_id
     from public.location_memberships
     where user_id = $1`,
    [userId]
  )

  return result.rows.map((membership) => membership.location_id)
}
