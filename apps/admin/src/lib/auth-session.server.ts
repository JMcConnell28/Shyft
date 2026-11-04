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
  return context?.membership.twoFactorEnabled ? context.session : null
}

async function readAdminAuthStatus() {
  const context = await readAdminSessionContext()
  return {
    authenticated: Boolean(context),
    needsTwoFactorSetup: Boolean(
      context && !context.membership.twoFactorEnabled
    ),
  }
}

async function requireAdminSession(): Promise<AdminSessionContext> {
  const context = await readAdminSessionContext()
  if (!context) {
    throw new Error("Unauthorized")
  }
  if (!context.membership.twoFactorEnabled)
    throw new Error("Admin multi-factor authentication is required.")
  return context
}

export { readAdminSession, requireAdminSession, readAdminAuthStatus }
export type { AdminSession }
