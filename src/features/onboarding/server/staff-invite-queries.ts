import "@tanstack/react-start/server-only"
import { z } from "zod"
import { staffInviteRowSchema } from "../schemas/staff-invite-schemas"
import { buildStaffInviteUrl } from "../utils/invite-utils"
import { requireStaffInviteAdmin } from "./staff-invite-context"
// eslint-disable-next-line no-duplicate-imports
import type { StaffInviteRow } from "../schemas/staff-invite-schemas"
import { ensureEmployeeStaffGroup } from "@/features/staff-groups/server/shared"
import { getDatabase } from "@/lib/db"

const namedIdSchema = z.object({ id: z.uuid(), name: z.string() })
const inviteColumns = `link.id, link.organization_id, organization.name as organization_name,
  coalesce(link.location_ids, array_remove(array[link.location_id], null)) as location_ids,
  link.default_staff_group_id, staff_group.name as staff_group_name,
  link.token, link.expires_at, link.disabled_at
  from public.staff_invite_links link
  join public."organization" organization on organization.id = link.organization_id
  join public.staff_groups staff_group on staff_group.id = link.default_staff_group_id`

async function findStaffInvite(token: string): Promise<StaffInviteRow | null> {
  const result = await getDatabase().query(
    `select ${inviteColumns} where link.token = $1`,
    [token]
  )
  const row: unknown = result.rows.at(0)
  return row ? staffInviteRowSchema.parse(row) : null
}

async function listInviteLocations(organizationId: string) {
  const result = await getDatabase().query(
    `select id, name from public.locations where organization_id = $1 order by created_at, name`,
    [organizationId]
  )
  return z.array(namedIdSchema).parse(result.rows)
}

async function getStaffInvitePreview(token: string) {
  const invite = await findStaffInvite(token)
  if (!invite) return null
  const locations = await listInviteLocations(invite.organization_id)
  const names = new Map(
    locations.map((location) => [location.id, location.name])
  )
  return {
    organizationId: invite.organization_id,
    organizationName: invite.organization_name,
    locationName:
      invite.location_ids
        .map((id) => names.get(id) ?? "Removed location")
        .join(", ") || "No active locations",
    staffGroupName: invite.staff_group_name,
    expiresAt: invite.expires_at?.toISOString() ?? null,
    isDisabled: invite.disabled_at !== null,
    isExpired:
      invite.expires_at !== null && invite.expires_at.getTime() <= Date.now(),
  }
}

async function getActiveStaffInviteLink(organizationId: string) {
  await requireStaffInviteAdmin(organizationId)
  await ensureEmployeeStaffGroup({ organizationId, locationId: null })
  const database = getDatabase()
  const [active, locations, groups] = await Promise.all([
    database.query(
      `select ${inviteColumns}
      where link.organization_id = $1 and link.disabled_at is null
      and (link.expires_at is null or link.expires_at > now())
      order by link.created_at desc limit 1`,
      [organizationId]
    ),
    listInviteLocations(organizationId),
    database.query(
      `select id, name from public.staff_groups
      where organization_id = $1 order by is_default desc, name`,
      [organizationId]
    ),
  ])
  const row: unknown = active.rows.at(0)
  const invite = row ? staffInviteRowSchema.parse(row) : null
  const staffGroups = z.array(namedIdSchema).parse(groups.rows)
  return {
    locations,
    defaults: staffGroups[0]
      ? {
          defaultStaffGroupId: staffGroups[0].id,
          defaultStaffGroupName: staffGroups[0].name,
        }
      : null,
    activeInvite: invite
      ? {
          joinUrl: buildStaffInviteUrl(invite.token),
          locationIds: invite.location_ids,
          staffGroupName: invite.staff_group_name,
          defaultStaffGroupId: invite.default_staff_group_id,
          expiresAt: invite.expires_at?.toISOString() ?? null,
        }
      : null,
  }
}

export { findStaffInvite, getActiveStaffInviteLink, getStaffInvitePreview }
