import "@tanstack/react-start/server-only"

import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"

function getAuthRequestHeaders() {
  return getRequestHeaders()
}

async function readSessionFromRequestHeaders() {
  return auth.api.getSession({ headers: getAuthRequestHeaders() })
}

type AuthSession = NonNullable<
  Awaited<ReturnType<typeof readSessionFromRequestHeaders>>
>

export { getAuthRequestHeaders, readSessionFromRequestHeaders }
export type { AuthSession }
