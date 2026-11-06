import "@tanstack/react-start/server-only"
import { requireVerifiedSessionOrThrow } from "./session"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

async function requireStaffInviteAdmin(
  organizationId: string
): Promise<string> {
  const { session } = await requireVerifiedSessionOrThrow()
  await requireOrgPermission({
    organizationId,
    userId: session.user.id,
    permissions: { invitation: ["create"] },
    errorMessage:
      "Only owners and admins can manage organization invite links.",
  })
  return session.user.id
}

export { requireStaffInviteAdmin }
