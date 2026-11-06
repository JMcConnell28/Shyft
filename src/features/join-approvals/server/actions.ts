import "@tanstack/react-start/server-only"

import { lockedJoinRequestSchema } from "./row-schemas"
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
  userId: string
}): Promise<string> {
  const client = await getDatabase().connect()
  try {
    await client.query("begin")
    await client.query(
      "select pg_advisory_xact_lock(hashtext($1), hashtext($2))",
      [input.organizationId, input.userId]
    )
    const existing = await client.query<{ id: string }>(
      `select id from public.staff_join_requests where organization_id = $1 and user_id = $2
       and (invite_link_id = $3 or status = 'pending') order by created_at desc limit 1`,
      [input.organizationId, input.userId, input.inviteLinkId]
    )
    let id = existing.rows[0]?.id
    if (!id) {
      const inserted = await client.query<{ id: string }>(
        `insert into public.staff_join_requests (organization_id, location_ids, staff_group_id, invite_link_id, user_id)
         select link.organization_id, coalesce(link.location_ids, array_remove(array[link.location_id], null)),
                link.default_staff_group_id, link.id, $3
         from public.staff_invite_links link
         where link.id = $1 and link.organization_id = $2 and link.disabled_at is null
           and (link.expires_at is null or link.expires_at > now()) returning id`,
        [input.inviteLinkId, input.organizationId, input.userId]
      )
      id = inserted.rows[0]?.id
    }
    if (!id)
      throw new Error("We could not send your join request. Please try again.")
    await client.query("commit")
    return id
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
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
      `select request.organization_id, coalesce(request.location_ids, array_remove(array[request.location_id], null)) as location_ids, request.staff_group_id,
              request.user_id, request.status, applicant.name, applicant.email,
              applicant."dateOfBirth"::text as "dateOfBirth"
       from public.staff_join_requests request
       join public."user" applicant on applicant.id = request.user_id
       where request.id = $1 and request.organization_id = $2
       for update of request`,
      [input.requestId, input.organizationId]
    )
    const row = result.rows.at(0)
    if (!row || row.status !== "pending") {
      throw new Error("This join request is no longer pending.")
    }
    const request = lockedJoinRequestSchema.parse(row)

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
