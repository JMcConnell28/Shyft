import { addDays, parseISO } from "date-fns"

import type {
  ExistingRotaRecord,
  PreviousPublishedSummary,
  RotaDetailRecord,
  RotaTemplateSummary,
} from "@/features/rota/types"
import type { RotaStatus } from "@/features/rota/schemas/rota-schemas"
import { createSupabaseServerClient } from "@/lib/supabase"
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

async function getTemplatesForLocation(
  organizationId: string,
  locationId: string
) {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("rota_templates")
    .select("id, name, description")
    .eq("organization_id", organizationId)
    .or(`location_id.is.null,location_id.eq.${locationId}`)
    .order("location_id", { ascending: true, nullsFirst: true })
    .order("name", { ascending: true })

  assertSupabaseSuccess(result.error, "We could not load rota templates.")

  return (result.data ?? []) as Array<RotaTemplateSummary>
}

async function getPreviousPublishedForLocation(
  organizationId: string,
  locationId: string,
  weekStart: string
): Promise<PreviousPublishedSummary | null> {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("rotas")
    .select("id, week_start, published_at")
    .eq("organization_id", organizationId)
    .eq("location_id", locationId)
    .eq("status", "published")
    .lt("week_start", weekStart)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle()

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
  organizationId: string,
  locationId: string,
  weekStart: string
): Promise<ExistingRotaRecord | null> {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("rotas")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("location_id", locationId)
    .eq("week_start", weekStart)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load that rota.")

  const row = result.data

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
  organizationId: string,
  locationId: string,
  rotaId: string,
  userId: string
): Promise<RotaDetailRecord | null> {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("rotas")
    .select(
      "id, status, note, week_start, created_by, created_at, updated_at, published_by_user_id, published_at, published_version, scheduled_hours, scheduled_staff_count, shift_count"
    )
    .eq("organization_id", organizationId)
    .eq("location_id", locationId)
    .eq("id", rotaId)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load that rota.")

  const row = result.data

  return row ? await buildRotaDetailRecord(row, locationId, userId) : null
}

export {
  findExistingRotaByWeek,
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
