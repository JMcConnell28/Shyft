import "@tanstack/react-start/server-only"
import { isEmployeeOnlyRole } from "../utils/employee-role"
import { requireVerifiedSessionOrThrow } from "./session"
import { findStaffInvite } from "./staff-invite-queries"
import { createStaffJoinRequest } from "@/features/join-approvals/server/actions"
import { getDatabase } from "@/lib/db"

async function acceptStaffInvite(
  token: string
): Promise<{ redirectTo: string }> {
  const { session } = await requireVerifiedSessionOrThrow()
  const invite = await findStaffInvite(token)
  if (!invite) throw new Error("That invite link is not valid anymore.")
  if (invite.disabled_at)
    throw new Error("That invite link has been turned off.")
  if (invite.expires_at && invite.expires_at.getTime() <= Date.now())
    throw new Error("That invite link has expired.")
  const membership = await getDatabase().query<{ role: string }>(
    `select role from public."member" where "organizationId" = $1 and "userId" = $2`,
    [invite.organization_id, session.user.id]
  )
  if (membership.rows.some((row) => !isEmployeeOnlyRole(row.role))) {
    throw new Error(
      "You already have elevated access to this organization. Staff invite links are only for employees."
    )
  }
  const requestId = await createStaffJoinRequest({
    inviteLinkId: invite.id,
    organizationId: invite.organization_id,
    userId: session.user.id,
  })
  return { redirectTo: `/join-status/${requestId}` }
}

export { acceptStaffInvite }
