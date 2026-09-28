import "@tanstack/react-start/server-only"

import type { LockedJoinRequest } from "@/features/join-approvals/server/types"
import { requireWorkspaceWriteAccess } from "@/features/billing/server/workspace-write-access"
import { syncWorkspaceBillingSubscriptionQuantities } from "@/features/billing/server/subscriptions"
import { provisionApprovedEmployee } from "@/features/join-approvals/server/provision-employee"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"

type RequestDecision = "approved" | "denied"

async function createStaffJoinRequest(input: {
  inviteLinkId: string
  organizationId: string
  locationId: string
  staffGroupId: string
  userId: string
}): Promise<string> {
  const database = getDatabase()
  const existing = await database.query<{ id: string }>(
    `select id from public.staff_join_requests
     where user_id = $1 and invite_link_id = $2`,
    [input.userId, input.inviteLinkId]
  )
  if (existing.rows[0]) return existing.rows[0].id

  const inserted = await database.query<{ id: string }>(
    `insert into public.staff_join_requests
       (organization_id, location_id, staff_group_id, invite_link_id, user_id)
     select $1::text, $2::uuid, $3::uuid, link.id, $5::text
     from public.staff_invite_links link
     where link.id = $4 and link.organization_id = $1
       and link.location_id = $2 and link.default_staff_group_id = $3
       and link.disabled_at is null
       and (link.expires_at is null or link.expires_at > now())
     on conflict do nothing
     returning id`,
    [
      input.organizationId,
      input.locationId,
      input.staffGroupId,
      input.inviteLinkId,
      input.userId,
    ]
  )
  if (inserted.rows[0]) return inserted.rows[0].id

  const pending = await database.query<{ id: string }>(
    `select id from public.staff_join_requests
     where organization_id = $1 and location_id = $2 and user_id = $3
       and status = 'pending'
     limit 1`,
    [input.organizationId, input.locationId, input.userId]
  )
  if (pending.rows[0]) return pending.rows[0].id
  throw new Error("We could not send your join request. Please try again.")
}

async function decideStaffJoinRequest(input: {
  organizationId: string
  requestId: string
  decision: RequestDecision
}): Promise<void> {
  const { session } = await requireVerifiedSessionOrThrow()
  await requireOrgPermission({
    organizationId: input.organizationId,
    userId: session.user.id,
    permissions: { teamMember: ["approve"] },
    errorMessage: "You cannot review join requests for this workplace.",
  })
  if (input.decision === "approved") {
    await requireWorkspaceWriteAccess({ organizationId: input.organizationId })
  }

  const client = await getDatabase().connect()
  try {
    await client.query("begin")
    const result = await client.query<LockedJoinRequest>(
      `select request.organization_id, request.location_id, request.staff_group_id,
              request.user_id, request.status, applicant.name, applicant.email,
              applicant."dateOfBirth"
       from public.staff_join_requests request
       join public."user" applicant on applicant.id = request.user_id
       where request.id = $1 and request.organization_id = $2
       for update of request`,
      [input.requestId, input.organizationId]
    )
    const request = result.rows.at(0)
    if (!request || request.status !== "pending") {
      throw new Error("This join request is no longer pending.")
    }

    if (input.decision === "approved") {
      await provisionApprovedEmployee(client, request)
    }
    await client.query(
      `update public.staff_join_requests
       set status = $1, decided_at = now(), decided_by = $2
       where id = $3`,
      [input.decision, session.user.id, input.requestId]
    )
    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }

  if (input.decision === "approved") {
    try {
      await syncWorkspaceBillingSubscriptionQuantities({
        organizationId: input.organizationId,
        userId: session.user.id,
      })
    } catch (error) {
      console.warn("Could not sync billing after staff approval.", error)
    }
  }
}

export { createStaffJoinRequest, decideStaffJoinRequest }
