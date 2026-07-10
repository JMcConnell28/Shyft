import { addDays, parseISO } from "date-fns"

import type {
  ExistingRotaRecord,
  PreviousPublishedSummary,
  RotaDetailRecord,
  RotaTemplateSummary,
} from "@/features/rota/types"
import type { RotaStatus } from "@/features/rota/schemas/rota-schemas"
import { getDatabase } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

import {
  getSeenPublishedVersionsMap,
  getUserNameMap,
  getZoneCountByLocationIds,
} from "@/features/rota/server/related-data"
import { buildWeekLabel, coerceNumber } from "@/features/rota/utils/week-utils"

async function getOrganizationSlugById(organizationId: string) {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("organization")
    .select("slug")
    .eq("id", organizationId)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load that workspace.")

  return result.data?.slug ?? null
}

async function getLocationOrganizationId(locationId: string) {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("locations")
    .select("organization_id")
    .eq("id", locationId)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load that location.")

  return result.data?.organization_id ?? null
}

async function getTemplatesForLocation(
  organizationId: string | null,
  locationId: string
): Promise<Array<RotaTemplateSummary>> {
  const result = await getDatabase().query<{
    id: string
    name: string
    description: string | null
    shift_count: string
  }>(
    `select
       template.id,
       template.name,
       template.description,
       count(template_shift.id) as shift_count
     from public.rota_templates template
     join public.rota_template_shifts template_shift
       on template_shift.template_id = template.id
     where template.location_id = $1
       and (
         ($2::text is not null and template.organization_id = $2::text)
         or ($2::text is null and template.organization_id is null)
       )
     group by template.id, template.name, template.description
     order by lower(template.name) asc`,
    [locationId, organizationId]
  )

  return result.rows.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    shiftCount: Number(template.shift_count),
  }))
}

async function getPreviousPublishedForLocation(
  organizationId: string | null,
  locationId: string,
  weekStart: string
): Promise<PreviousPublishedSummary | null> {
  const supabase = createSupabaseServerClient()
  const query = supabase
    .from("rotas")
    .select("id, week_start, published_at")
    .eq("location_id", locationId)
    .eq("status", "published")
    .lt("week_start", weekStart)
    .order("week_start", { ascending: false })
    .limit(1)
  const result = await (
    organizationId
      ? query.eq("organization_id", organizationId)
      : query.is("organization_id", null)
  ).maybeSingle()

  assertSupabaseSuccess(
    result.error,
    "We could not load the previous published rota."
  )

  const row = result.data

  if (!row) {
    return null
  }

  const weekEnd = addDays(parseISO(row.week_start), 6)
    .toISOString()
    .slice(0, 10)

  return {
    id: row.id,
    weekStart: row.week_start,
    weekEnd,
    weekLabel: buildWeekLabel(row.week_start),
    publishedAt: row.published_at,
  }
}

async function findExistingRotaByWeek(
  organizationId: string | null,
  locationId: string,
  weekStart: string
): Promise<ExistingRotaRecord | null> {
  const result = await getDatabase().query<{ id: string }>(
    `select id
     from public.rotas
     where location_id = $1
       and week_start = $2
       and (
         ($3::text is not null and organization_id = $3::text)
         or ($3::text is null and organization_id is null)
       )
     order by updated_at desc, created_at desc
     limit 1`,
    [locationId, weekStart, organizationId]
  )
  const row = result.rows.at(0)

  if (!row) {
    return null
  }

  return {
    id: row.id,
  }
}

async function markRotaPublishedVersionSeen(
  rotaId: string,
  userId: string,
  publishedVersion: number
) {
  const supabase = createSupabaseServerClient()
  const existingVersions = await getSeenPublishedVersionsMap([rotaId], userId)
  const nextSeenVersion = Math.max(
    existingVersions.get(rotaId) ?? 0,
    publishedVersion
  )
  const now = new Date().toISOString()
  const result = await supabase.from("rota_reads").upsert(
    {
      rota_id: rotaId,
      user_id: userId,
      seen_published_version: nextSeenVersion,
      seen_at: now,
      updated_at: now,
    },
    {
      onConflict: "rota_id,user_id",
    }
  )

  assertSupabaseSuccess(result.error, "We could not mark the rota as seen.")
}

async function getRotaDetailRecord(
  organizationId: string | null,
  locationId: string,
  rotaId: string,
  userId: string
): Promise<RotaDetailRecord | null> {
  const supabase = createSupabaseServerClient()
  const query = supabase
    .from("rotas")
    .select(
      "id, status, note, week_start, created_by, created_at, updated_at, published_by_user_id, published_at, published_version, scheduled_hours, scheduled_staff_count, shift_count"
    )
    .eq("location_id", locationId)
    .eq("id", rotaId)
  const result = await (
    organizationId
      ? query.eq("organization_id", organizationId)
      : query.is("organization_id", null)
  ).maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load that rota.")

  const row = result.data

  return row ? await buildRotaDetailRecord(row, locationId, userId) : null
}

export {
  findExistingRotaByWeek,
  getLocationOrganizationId,
  getOrganizationSlugById,
  getPreviousPublishedForLocation,
  getRotaDetailRecord,
  getTemplatesForLocation,
  markRotaPublishedVersionSeen,
}

async function buildRotaDetailRecord(
  row: {
    id: string
    status: string
    note: string | null
    week_start: string
    created_by: string
    created_at: string
    updated_at: string
    published_by_user_id: string | null
    published_at: string | null
    published_version: number
    scheduled_hours: number
    scheduled_staff_count: number
    shift_count: number
  },
  locationId: string,
  userId: string
): Promise<RotaDetailRecord> {
  const [userNameMap, zoneCounts, seenVersions] = await Promise.all([
    getUserNameMap(
      [row.created_by, row.published_by_user_id].filter(
        (value): value is string => Boolean(value)
      )
    ),
    getZoneCountByLocationIds([locationId]),
    getSeenPublishedVersionsMap([row.id], userId),
  ])

  const weekEnd = addDays(parseISO(row.week_start), 6)
    .toISOString()
    .slice(0, 10)
  const isUnread =
    row.status === "published" &&
    row.published_version > (seenVersions.get(row.id) ?? 0) &&
    row.published_by_user_id !== userId

  return {
    id: row.id,
    status: row.status as RotaStatus,
    note: row.note,
    weekStart: row.week_start,
    weekEnd,
    weekLabel: buildWeekLabel(row.week_start),
    createdBy: userNameMap.get(row.created_by) ?? "Unknown",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedBy: row.published_by_user_id
      ? (userNameMap.get(row.published_by_user_id) ?? null)
      : null,
    publishedAt: row.published_at,
    publishedVersion: row.published_version,
    publishedByUserId: row.published_by_user_id,
    scheduledHours: coerceNumber(row.scheduled_hours),
    scheduledStaffCount: row.scheduled_staff_count,
    shiftCount: row.shift_count,
    zoneCount: zoneCounts.get(locationId) ?? 0,
    isUnread,
  }
}
