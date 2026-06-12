import type { RotaDetailPageData } from "@/features/rota/types"
import { getOrgCapabilitiesForRole } from "@/lib/auth/get-org-capabilities"
import {
  getWeekRangeFromStart,
  normalizeWeekStart,
  toIsoDate,
} from "@/lib/rota-schemas"

import { listAccessibleLocations } from "@/features/rota/server/access"
import {
  getPreviousPublishedForLocation,
  getRotaDetailRecord,
  getTemplatesForLocation,
  markRotaPublishedVersionSeen,
} from "@/features/rota/server/lookups"
import { formatUpdatedAt } from "@/features/rota/utils/week-utils"
import { getMembershipRole } from "@/features/rota/server/membership"
import { getLocationRole } from "@/lib/auth/has-location-permission"

async function getRotaDetailPageData({
  organizationId,
  locationId,
  orgSlug,
  userId,
  locationSlug,
  weekStart,
  rotaId,
}: {
  organizationId?: string
  locationId?: string
  orgSlug?: string
  userId: string
  locationSlug: string
  weekStart?: string
  rotaId: string
}): Promise<RotaDetailPageData | null> {
  const workspaceOrganizationId = organizationId ?? null
  const role = workspaceOrganizationId
    ? await getMembershipRole(workspaceOrganizationId, userId)
    : locationId
      ? await getLocationRole(locationId, userId)
      : null
  const capabilities = getOrgCapabilitiesForRole(role)

  if (!capabilities.canViewRota) {
    return null
  }

  const locations = await listAccessibleLocations(workspaceOrganizationId, userId, role)
  const selectedLocation =
    locations.find((location) => location.slug === locationSlug) ?? null

  if (!selectedLocation) {
    return null
  }

  let detailRecord = await getRotaDetailRecord(
    workspaceOrganizationId,
    selectedLocation.id,
    rotaId,
    userId
  )

  if (
    detailRecord?.status === "published" &&
    detailRecord.isUnread &&
    detailRecord.publishedVersion > 0
  ) {
    await markRotaPublishedVersionSeen(
      detailRecord.id,
      userId,
      detailRecord.publishedVersion
    )

    detailRecord = await getRotaDetailRecord(
      workspaceOrganizationId,
      selectedLocation.id,
      rotaId,
      userId
    )
  }

  const refreshedLocations =
    detailRecord?.status === "published"
      ? await listAccessibleLocations(workspaceOrganizationId, userId, role)
      : locations
  const nextSelectedLocation =
    refreshedLocations.find((location) => location.slug === locationSlug) ??
    selectedLocation
  const [templates, previousPublished] = await Promise.all([
    getTemplatesForLocation(workspaceOrganizationId, nextSelectedLocation.id),
    getPreviousPublishedForLocation(
      workspaceOrganizationId,
      nextSelectedLocation.id,
      detailRecord?.weekStart ?? normalizeWeekStart(weekStart ?? new Date())
    ),
  ])
  const resolvedWeekStart =
    detailRecord?.weekStart ?? normalizeWeekStart(weekStart ?? new Date())
  const weekRange = getWeekRangeFromStart(resolvedWeekStart)

  return {
    orgSlug: orgSlug ?? locationSlug,
    organizationId: workspaceOrganizationId ?? nextSelectedLocation.id,
    workspaceType: workspaceOrganizationId ? "organization" : "location",
    locationWorkspaceSlug: workspaceOrganizationId ? undefined : locationSlug,
    capabilities,
    locations: refreshedLocations,
    selectedLocation: nextSelectedLocation,
    templates,
    previousPublished,
    weekStart: resolvedWeekStart,
    weekEnd: toIsoDate(weekRange.end),
    weekLabel: `${weekRange.startLabel} - ${weekRange.endLabel}`,
    hasUnreadRotaUpdates: refreshedLocations.some(
      (location) => location.hasUnreadPublished
    ),
    mode: detailRecord ? "existing" : "empty",
    rota: detailRecord
      ? {
          id: detailRecord.id,
          status: detailRecord.status,
          note: detailRecord.note,
          weekStart: detailRecord.weekStart,
          weekEnd: detailRecord.weekEnd,
          weekLabel: detailRecord.weekLabel,
          createdBy: detailRecord.createdBy,
          createdAt: formatUpdatedAt(detailRecord.createdAt),
          updatedAt: formatUpdatedAt(detailRecord.updatedAt),
          publishedBy: detailRecord.publishedBy,
          publishedAt: detailRecord.publishedAt
            ? formatUpdatedAt(detailRecord.publishedAt)
            : null,
          publishedVersion: detailRecord.publishedVersion,
          scheduledHours: detailRecord.scheduledHours,
          scheduledStaffCount: detailRecord.scheduledStaffCount,
          shiftCount: detailRecord.shiftCount,
          zoneCount: detailRecord.zoneCount,
        }
      : null,
  }
}

export { getRotaDetailPageData }
