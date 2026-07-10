import { createServerFn } from "@tanstack/react-start"

const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const { readSessionFromRequestHeaders } = await import(
    "@/lib/auth-session.server"
  )

  return readSessionFromRequestHeaders()
})

const ensureSession = createServerFn({ method: "GET" }).handler(async () => {
  const { readSessionFromRequestHeaders } = await import(
    "@/lib/auth-session.server"
  )
  const session = await readSessionFromRequestHeaders()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return session
})

export { ensureSession, getSession }
