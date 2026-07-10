import {
  getAuthRequestHeaders,
  readSessionFromRequestHeaders,
} from "@/lib/auth-session.server"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"

async function requireVerifiedSessionOrThrow() {
  const headers = getAuthRequestHeaders()
  const session = await readSessionFromRequestHeaders()

  if (!session) {
    throw new Error("You need to sign in to continue.")
  }

  if (!isEmailVerificationSatisfied(session.user.emailVerified)) {
    throw new Error("Verify your email before continuing.")
  }

  return { headers, session }
}

export { requireVerifiedSessionOrThrow }
