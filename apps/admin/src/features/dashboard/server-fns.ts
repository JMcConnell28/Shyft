import { createServerFn } from "@tanstack/react-start"

const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdminSession } = await import("@/lib/auth-session.server")
  const { getDashboardData } = await import(
    "@/features/dashboard/server/queries"
  )

  await requireAdminSession()
  return getDashboardData()
})

export { getDashboard }
