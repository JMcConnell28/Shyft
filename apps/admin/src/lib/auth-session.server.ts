import "@tanstack/react-start/server-only"

import { getRequestHeaders } from "@tanstack/react-start/server"

import type { AdminMembership } from "@/features/auth/types"
import { auth } from "@/lib/auth"
import { getActiveAdminMembership } from "@/features/auth/server/admin-session"

type AdminSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
type AdminSessionContext = {
  membership: AdminMembership
  session: AdminSession
}

async function readAdminSessionContext(): Promise<AdminSessionContext | null> {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session) return null

  const membership = await getActiveAdminMembership(session.user.id)
  return membership ? { membership, session } : null
}

async function readAdminSession(): Promise<AdminSession | null> {
  const context = await readAdminSessionContext()
  return context?.session ?? null
}

async function requireAdminSession(): Promise<AdminSessionContext> {
  const context = await readAdminSessionContext()
  if (!context) {
    throw new Error("Unauthorized")
  }
  return context
}

export { readAdminSession, requireAdminSession }
export type { AdminSession }
