import { addDays, parseISO } from "date-fns"

import type { RotaListPageData } from "@/features/rota/types"
import type { RotaListSearch, RotaStatus } from "@/features/rota/schemas/rota-schemas"
import {
  getOrgCapabilitiesForRole,
  type OrganizationCapabilities,
} from "@/lib/auth/get-org-capabilities"
import { createSupabaseServerClient } from "@/lib/supabase"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"
import { normalizeWeekStart } from "@/lib/rota-schemas"

import { listAccessibleLocations } from "@/features/rota/server/access"
import { getMembershipRole } from "@/features/rota/server/membership"
import {
  getSeenPublishedVersionsMap,
  getUserNameMap,
  getZoneCountByLocationIds,
} from "@/features/rota/server/related-data"
import { getTemplatesForLocation } from "@/features/rota/server/lookups"
import {
  buildWeekLabel,
  coerceNumber,
  formatUpdatedAt,
} from "@/features/rota/utils/week-utils"

function buildEmptyRotaListPageData({
  orgSlug,
  organizationId,
  search,
  locations,
  hasUnreadRotaUpdates,
  capabilities,
}: {
  orgSlug: string
  organizationId: string
  search: RotaListSearch
  locations: RotaListPageData["locations"]
  hasUnreadRotaUpdates: boolean
  capabilities: OrganizationCapabilities
}): RotaListPageData {
  return {
    orgSlug,
    organizationId,
    capabilities,
    locations,
    selectedLocation: null,
    filters: search,
    overview: {
      upcomingWeeks: 0,
      draftRotas: 0,
      publishedRotas: 0,
      unreadPublishedRotas: 0,
    },
    latestDraft: null,
    templates: [],
    rows: [],
    pagination: {
      page: search.page,
      pageSize: search.pageSize,
      totalItems: 0,
      totalPages: 1,
    },
    hasUnreadRotaUpdates,
  }
}

async function getRotaListPageData({
  organizationId,
  orgSlug,
  userId,
  search,
}: {
  organizationId: string
  orgSlug: string
  userId: string
  search: RotaListSearch
}): Promise<RotaListPageData> {
  const role = await getMembershipRole(organizationId, userId)
  const capabilities = getOrgCapabilitiesForRole(role)
  const locations = await listAccessibleLocations(organizationId, userId, role)
  const hasUnreadRotaUpdates = locations.some(
    (location) => location.hasUnreadPublished,
  )

  if (!capabilities.canViewRota) {
    return buildEmptyRotaListPageData({
      orgSlug,
      organizationId,
      search,
      locations: [],
      hasUnreadRotaUpdates: false,
      capabilities,
    })
  }

  const selectedLocation =
    (search.location
      ? locations.find((location) => location.slug === search.location)
      : null) ??
    locations.at(0) ??
    null

  if (!selectedLocation) {
    return buildEmptyRotaListPageData({
      orgSlug,
      organizationId,
      search,
      locations,
      hasUnreadRotaUpdates,
      capabilities,
    })
  }

  const [allLocationRotas, filteredRotas, templates, zoneCounts] = await Promise.all([
    listLocationRotas({
      organizationId,
      locationId: selectedLocation.id,
    }),
    listLocationRotas({
      organizationId,
      locationId: selectedLocation.id,
      search,
    }),
    getTemplatesForLocation(organizationId, selectedLocation.id),
    getZoneCountByLocationIds([selectedLocation.id]),
  ])

  const seenVersions = await getSeenPublishedVersionsMap(
    allLocationRotas
      .filter((rota) => rota.status === "published")
      .map((rota) => rota.id),
    userId,
  )
  const userNameMap = await getUserNameMap(
    Array.from(
      new Set(
        filteredRotas.flatMap((rota) =>
          [rota.created_by, rota.published_by_user_id].filter(
            (value): value is string => Boolean(value),
          ),
        ),
      ),
    ),
  )
  const currentWeekStart = normalizeWeekStart(new Date())
  const zoneCount = zoneCounts.get(selectedLocation.id) ?? 0
  const sortedRotas = sortRotas(filteredRotas, currentWeekStart)
  const totalItems = sortedRotas.length
  const totalPages = Math.max(1, Math.ceil(totalItems / search.pageSize))
  const safePage = Math.min(search.page, totalPages)
  const offset = (safePage - 1) * search.pageSize
  const pagedRotas = sortedRotas.slice(offset, offset + search.pageSize)

  return {
    orgSlug,
    organizationId,
    capabilities,
    locations,
    selectedLocation,
    filters: {
      ...search,
      location: selectedLocation.slug,
      page: safePage,
    },
    overview: buildOverview(allLocationRotas, seenVersions, currentWeekStart, userId),
    latestDraft: buildLatestDraft(allLocationRotas, selectedLocation.slug),
    templates,
    rows: pagedRotas.map((rota) => {
      const weekEnd = addDays(parseISO(rota.week_start), 6).toISOString().slice(0, 10)
      const isUnread =
        rota.status === "published" &&
        rota.published_version > (seenVersions.get(rota.id) ?? 0) &&
        rota.published_by_user_id !== userId

      return {
        id: rota.id,
        locationId: selectedLocation.id,
        locationName: selectedLocation.name,
        locationSlug: selectedLocation.slug,
        weekStart: rota.week_start,
        weekEnd,
        weekLabel: buildWeekLabel(rota.week_start),
        status: rota.status as RotaStatus,
        createdBy: userNameMap.get(rota.created_by) ?? "Unknown",
        publishedBy: rota.published_by_user_id
          ? userNameMap.get(rota.published_by_user_id) ?? null
          : null,
        updatedAt: formatUpdatedAt(rota.updated_at),
        scheduledHours: coerceNumber(rota.scheduled_hours),
        scheduledStaffCount: rota.scheduled_staff_count,
        shiftCount: rota.shift_count,
        zoneCount,
        note: rota.note,
        isUnread,
      }
    }),
    pagination: {
      page: safePage,
      pageSize: search.pageSize,
      totalItems,
      totalPages,
    },
    hasUnreadRotaUpdates,
  }
}

type RawRotaRow = {
  id: string
  week_start: string
  status: string
  created_by: string
  updated_at: string
  published_by_user_id: string | null
  published_version: number
  scheduled_hours: number
  scheduled_staff_count: number
  shift_count: number
  note: string | null
}

async function listLocationRotas({
  organizationId,
  locationId,
  search,
}: {
  organizationId: string
  locationId: string
  search?: RotaListSearch
}): Promise<Array<RawRotaRow>> {
  const supabase = createSupabaseServerClient()
  let query = supabase
    .from("rotas")
    .select(
      "id, week_start, status, created_by, updated_at, published_by_user_id, published_version, scheduled_hours, scheduled_staff_count, shift_count, note",
    )
    .eq("organization_id", organizationId)
    .eq("location_id", locationId)

  if (search?.status && search.status !== "all") {
    query = query.eq("status", search.status)
  }

  if (search?.range === "this-week") {
    const currentWeek = normalizeWeekStart(new Date())
    query = query.eq("week_start", currentWeek)
  }

  if (search?.range === "next-4-weeks") {
    const currentWeek = normalizeWeekStart(new Date())
    const endWeek = addDays(parseISO(currentWeek), 21).toISOString().slice(0, 10)
    query = query.gte("week_start", currentWeek).lte("week_start", endWeek)
  }

  if (search?.range === "past-4-weeks") {
    const currentWeek = normalizeWeekStart(new Date())
    const startWeek = addDays(parseISO(currentWeek), -28).toISOString().slice(0, 10)
    const previousWeek = addDays(parseISO(currentWeek), -7).toISOString().slice(0, 10)
    query = query.gte("week_start", startWeek).lte("week_start", previousWeek)
  }

  if (search?.range === "custom") {
    if (search.from) {
      query = query.gte("week_start", normalizeWeekStart(search.from))
    }

    if (search.to) {
      query = query.lte("week_start", normalizeWeekStart(search.to))
    }
  }

  const result = await query

  assertSupabaseSuccess(result.error, "We could not load rota records.")

  return (result.data ?? []) as Array<RawRotaRow>
}

function buildOverview(
  rows: Array<RawRotaRow>,
  seenVersions: Map<string, number>,
  currentWeekStart: string,
  userId: string,
) {
  return rows.reduce(
    (overview, rota) => {
      if (rota.week_start >= currentWeekStart) {
        overview.upcomingWeeks += 1
      }

      if (rota.status === "draft") {
        overview.draftRotas += 1
      }

      if (rota.status === "published") {
        overview.publishedRotas += 1
      }

      const isUnread =
        rota.status === "published" &&
        rota.published_version > (seenVersions.get(rota.id) ?? 0) &&
        rota.published_by_user_id !== userId

      if (isUnread) {
        overview.unreadPublishedRotas += 1
      }

      return overview
    },
    {
      upcomingWeeks: 0,
      draftRotas: 0,
      publishedRotas: 0,
      unreadPublishedRotas: 0,
    },
  )
}

function buildLatestDraft(
  rows: Array<RawRotaRow>,
  locationSlug: string,
) {
  const latestDraft = rows
    .filter((rota) => rota.status === "draft")
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .at(0)

  if (!latestDraft) {
    return null
  }

  const weekEnd = addDays(parseISO(latestDraft.week_start), 6)

  return {
    id: latestDraft.id,
    locationSlug,
    weekStart: latestDraft.week_start,
    weekEnd: weekEnd.toISOString().slice(0, 10),
    weekLabel: buildWeekLabel(latestDraft.week_start),
    updatedAt: formatUpdatedAt(latestDraft.updated_at),
  }
}

function sortRotas(rows: Array<RawRotaRow>, currentWeekStart: string) {
  return [...rows].sort((left, right) => {
    const leftIsUpcoming = left.week_start >= currentWeekStart
    const rightIsUpcoming = right.week_start >= currentWeekStart

    if (leftIsUpcoming !== rightIsUpcoming) {
      return leftIsUpcoming ? -1 : 1
    }

    if (left.week_start !== right.week_start) {
      if (leftIsUpcoming) {
        return left.week_start.localeCompare(right.week_start)
      }

      return right.week_start.localeCompare(left.week_start)
    }

    return right.updated_at.localeCompare(left.updated_at)
  })
}

export { getRotaListPageData }

