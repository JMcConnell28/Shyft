import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

type PublishedRotaUnreadRow = {
  id: string
  location_id: string
  published_by_user_id: string | null
  published_version: number
}

async function getUserNameMap(userIds: Array<string>): Promise<Map<string, string>> {
  if (userIds.length === 0) {
    return new Map()
  }

  const supabase = createSupabaseServerClient()
  const result = await supabase.from("user").select("id, name").in("id", userIds)

  assertSupabaseSuccess(result.error, "We could not load user details.")

  return new Map((result.data ?? []).map((user) => [user.id, user.name]))
}

async function getSeenPublishedVersionsMap(
  rotaIds: Array<string>,
  userId: string,
): Promise<Map<string, number>> {
  if (rotaIds.length === 0) {
    return new Map()
  }

  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("rota_reads")
    .select("rota_id, seen_published_version")
    .eq("user_id", userId)
    .in("rota_id", rotaIds)

  assertSupabaseSuccess(result.error, "We could not load rota read state.")

  return new Map(
    (result.data ?? []).map((row) => [row.rota_id, row.seen_published_version]),
  )
}

async function getZoneCountByLocationIds(
  locationIds: Array<string>,
): Promise<Map<string, number>> {
  if (locationIds.length === 0) {
    return new Map()
  }

  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("zones")
    .select("location_id")
    .in("location_id", locationIds)
    .is("deleted_at", null)

  assertSupabaseSuccess(result.error, "We could not load zone counts.")

  const counts = new Map<string, number>()

  for (const row of result.data ?? []) {
    counts.set(row.location_id, (counts.get(row.location_id) ?? 0) + 1)
  }

  return counts
}

async function listPublishedRotasForLocations(
  organizationId: string | null,
  locationIds: Array<string>,
): Promise<Array<PublishedRotaUnreadRow>> {
  if (locationIds.length === 0) {
    return []
  }

  const supabase = createSupabaseServerClient()
  const query = supabase
    .from("rotas")
    .select("id, location_id, published_by_user_id, published_version")
    .eq("status", "published")
    .in("location_id", locationIds)
  const result = await (organizationId
    ? query.eq("organization_id", organizationId)
    : query.is("organization_id", null))

  assertSupabaseSuccess(
    result.error,
    "We could not load published rota updates.",
  )

  return result.data ?? []
}

export {
  getSeenPublishedVersionsMap,
  getUserNameMap,
  getZoneCountByLocationIds,
  listPublishedRotasForLocations,
}

