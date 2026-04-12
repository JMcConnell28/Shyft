import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"

async function requireVerifiedSessionOrThrow() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new Error("You need to sign in to continue.")
  }

  if (!isEmailVerificationSatisfied(session.user.emailVerified)) {
    throw new Error("Verify your email before continuing.")
  }

  return { headers, session }
}

export { requireVerifiedSessionOrThrow }
