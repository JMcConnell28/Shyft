import "@tanstack/react-start/server-only"

import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getDatabase } from "@/lib/db"

const supportRoles = ["owner", "admin", "manager"] as const

async function requireCustomerSupportAccess(organizationId: string) {
  const { session } = await requireVerifiedSessionOrThrow()
  const result = await getDatabase().query<{ role: string }>(
    `select role from public.member
     where "organizationId" = $1 and "userId" = $2
     limit 1`,
    [organizationId, session.user.id]
  )
  if (!supportRoles.some((role) => role === result.rows[0]?.role)) {
    throw new Error("You do not have access to workplace support.")
  }
  return { userId: session.user.id, organizationId }
}

export { requireCustomerSupportAccess }
