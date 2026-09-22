import "@tanstack/react-start/server-only"

import type { NavigationSession } from "@/features/navigation/types"
import { readSessionFromRequestHeaders } from "@/lib/auth-session.server"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"

async function readNavigationSession(): Promise<NavigationSession | null> {
  const session = await readSessionFromRequestHeaders()

  if (!session) return null

  // Only public session metadata is dehydrated into the navigation cache.
  return {
    sessionId: session.session.id,
    expiresAt: new Date(session.session.expiresAt).getTime(),
    activeOrganizationId: session.session.activeOrganizationId ?? null,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailVerified: isEmailVerificationSatisfied(session.user.emailVerified),
    },
  }
}

export { readNavigationSession }
