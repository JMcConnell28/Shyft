import "@tanstack/react-start/server-only"

import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { timeServerOperation } from "@/lib/server-timing"

function getAuthRequestHeaders() {
  return getRequestHeaders()
}

async function readSessionFromRequestHeaders() {
  return timeServerOperation("auth", () =>
    auth.api.getSession({ headers: getAuthRequestHeaders() })
  )
}

type AuthSession = NonNullable<
  Awaited<ReturnType<typeof readSessionFromRequestHeaders>>
>

export { getAuthRequestHeaders, readSessionFromRequestHeaders }
export type { AuthSession }
