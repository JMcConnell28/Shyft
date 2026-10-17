import "@tanstack/react-start/server-only"

import { z } from "zod"
import type { DashboardLocation, ManagerDashboardAccess } from "../types"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { listPermittedRotaLocations } from "@/features/rota/server/access"
import { listLocationEntitlements } from "@/features/billing/server/entitlements"
import { getOrganizationRole } from "@/lib/auth/has-org-permission"
import { getOrgCapabilitiesForRole } from "@/lib/auth/workspace-capabilities"
import { getDatabase } from "@/lib/db"

const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  time_zone: z.string().refine((value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value })
      return true
    } catch {
      return false
    }
  }),
  time_format: z.enum(["12h", "24h"]),
  late_grace: z.number(),
})

async function resolveManagerDashboardAccess(
  organizationId: string
): Promise<ManagerDashboardAccess & { userId: string }> {
  const { session } = await requireVerifiedSessionOrThrow()
  if (session.session.activeOrganizationId !== organizationId) {
    throw new Error("Your active workspace has changed. Refresh and try again.")
  }
  const role = await getOrganizationRole(organizationId, session.user.id)
  const capabilities = getOrgCapabilitiesForRole(role)
  if (!capabilities.canManageRota && !capabilities.canManageTimeClock) {
    throw new Error("You do not have permission to view the manager dashboard.")
  }
  const permitted = await listPermittedRotaLocations(
    organizationId,
    session.user.id,
    role
  )
  const ids = permitted.map((location) => location.id)
  if (!ids.length)
    return { capabilities, userId: session.user.id, locations: [] }
  const [result, entitlements] = await Promise.all([
    getDatabase().query(
      `select l.id, l.name, l.slug, coalesce(c.timezone, 'Europe/London') as time_zone,
              coalesce(r.time_format, '12h') as time_format,
              coalesce(c.late_clock_in_grace_minutes, 5) as late_grace
       from public.locations l
       left join public.location_clock_settings c on c.location_id = l.id
       left join public.location_rota_settings r on r.location_id = l.id
       where l.organization_id = $1 and l.id = any($2::uuid[])
       order by l.created_at, l.name`,
      [organizationId, ids]
    ),
    listLocationEntitlements(ids),
  ])
  const entitlementById = new Map(
    entitlements.map((item) => [item.locationId, item])
  )
  const locations: Array<DashboardLocation> = z
    .array(locationSchema)
    .parse(result.rows)
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      timeZone: row.time_zone,
      timeFormat: row.time_format,
      lateGraceMinutes: row.late_grace,
      attendanceEnabled:
        capabilities.canManageTimeClock &&
        Boolean(entitlementById.get(row.id)?.timeAttendanceEnabled),
      canWrite: Boolean(entitlementById.get(row.id)?.canWrite),
    }))
  return { locations, capabilities, userId: session.user.id }
}

function requireDashboardLocation(
  locations: Array<DashboardLocation>,
  locationId: string
): DashboardLocation {
  const location = locations.find((item) => item.id === locationId)
  if (!location)
    throw new Error("Choose a location you can manage in this workspace.")
  return location
}

export { resolveManagerDashboardAccess, requireDashboardLocation }
