import { createServerFn } from "@tanstack/react-start"

const getAdminRouteSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requireAdminSession } = await import("@/lib/auth-session.server")
    return requireAdminSession()
  },
)

const getOptionalAdminRouteSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const { readAdminSession } = await import("@/lib/auth-session.server")
    return readAdminSession()
  },
)

export { getAdminRouteSession, getOptionalAdminRouteSession }
