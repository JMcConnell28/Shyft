import "@tanstack/react-start/server-only"

import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { requireAdminMembership } from "@/features/auth/server/admin-session"

async function readAdminSession() {
  return auth.api.getSession({ headers: getRequestHeaders() })
}

async function requireAdminSession() {
  const session = await readAdminSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const membership = await requireAdminMembership(session.user.id)

  return {
    membership,
    session,
  }
}

type AdminSession = NonNullable<Awaited<ReturnType<typeof readAdminSession>>>

export { readAdminSession, requireAdminSession }
export type { AdminSession }
