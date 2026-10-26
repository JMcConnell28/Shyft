import "@tanstack/react-start/server-only"
import { setResponseHeader } from "@tanstack/react-start/server"
import { auth } from "@/lib/auth"
import { getAuthRequestHeaders } from "@/lib/auth-session.server"

async function requirePersonalDataSession() {
  setResponseHeader("Cache-Control", "private, no-store")
  const session = await auth.api.getSession({
    headers: getAuthRequestHeaders(),
    query: { disableCookieCache: true },
  })
  if (!session)
    throw new Error("Sign in to access your personal data requests.")
  if (!session.user.emailVerified)
    throw new Error(
      "Verify your email before requesting or downloading personal data."
    )
  return session
}
export { requirePersonalDataSession }
