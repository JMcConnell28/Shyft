import "@tanstack/react-start/server-only"

import { joinRequestRowSchema } from "./row-schemas"
import type { JoinRequest } from "@/features/join-approvals/types"
// eslint-disable-next-line no-duplicate-imports
import type { JoinRequestRow } from "./row-schemas"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getDatabase } from "@/lib/db"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

const joinRequestColumns = `
  request.id, request.organization_id, organization.name as organization_name,
  organization.slug as organization_slug,
  array(select coalesce(location.name, 'Removed location')
    from unnest(coalesce(request.location_ids, array_remove(array[request.location_id], null))) selected(id)
    left join public.locations location on location.id = selected.id) as location_names,
  staff_group.name as staff_group_name,
  applicant.name as user_name, applicant.email as user_email,
  request.status, request.created_at, request.decided_at
from public.staff_join_requests request
join public."organization" organization on organization.id = request.organization_id
join public."user" applicant on applicant.id = request.user_id
left join public.staff_groups staff_group on staff_group.id = request.staff_group_id`

function mapJoinRequest(row: JoinRequestRow): JoinRequest {
  return {
    id: row.id,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    organizationSlug: row.organization_slug,
    locationName: row.location_names.join(", ") || "No active locations",
    staffGroupName: row.staff_group_name ?? "Removed group",
    userName: row.user_name,
    userEmail: row.user_email,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    decidedAt: row.decided_at?.toISOString() ?? null,
  }
}

async function getOwnJoinRequest(requestId: string): Promise<JoinRequest> {
  const { session } = await requireVerifiedSessionOrThrow()
  const result = await getDatabase().query<JoinRequestRow>(
    `select ${joinRequestColumns}
     where request.id = $1 and request.user_id = $2`,
    [requestId, session.user.id]
  )
  const row = result.rows.at(0)
  if (!row) throw new Error("We could not find that join request.")
  return mapJoinRequest(joinRequestRowSchema.parse(row))
}

async function listOwnJoinRequests(): Promise<Array<JoinRequest>> {
  const { session } = await requireVerifiedSessionOrThrow()
  const result = await getDatabase().query<JoinRequestRow>(
    `select ${joinRequestColumns}
     where request.user_id = $1 and request.status = 'pending'
     order by request.created_at desc`,
    [session.user.id]
  )
  return result.rows.map((row) =>
    mapJoinRequest(joinRequestRowSchema.parse(row))
  )
}

async function listPendingJoinRequests(
  organizationId: string
): Promise<Array<JoinRequest>> {
  const { session } = await requireVerifiedSessionOrThrow()
  await requireOrgPermission({
    organizationId,
    userId: session.user.id,
    permissions: { teamMember: ["approve"] },
    errorMessage: "You cannot review join requests for this workplace.",
  })
  const result = await getDatabase().query<JoinRequestRow>(
    `select ${joinRequestColumns}
     where request.organization_id = $1 and request.status = 'pending'
     order by request.created_at asc`,
    [organizationId]
  )
  return result.rows.map((row) =>
    mapJoinRequest(joinRequestRowSchema.parse(row))
  )
}

export { getOwnJoinRequest, listOwnJoinRequests, listPendingJoinRequests }
