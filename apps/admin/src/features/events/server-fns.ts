import { createServerFn } from "@tanstack/react-start"

const getEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdminSession } = await import("@/lib/auth-session.server")
  const { listProductEvents } = await import("@/features/events/server/queries")

  await requireAdminSession()
  return listProductEvents()
})

export { getEvents }
