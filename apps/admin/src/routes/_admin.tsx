import { createFileRoute, redirect } from "@tanstack/react-router"

import { AdminShell } from "@/components/layout/admin-shell"
import { getAdminRouteSession } from "@/features/auth/server-fns"

export const Route = createFileRoute("/_admin")({
  beforeLoad: async ({ location }) => {
    try {
      return await getAdminRouteSession()
    } catch {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { membership } = Route.useRouteContext()

  return <AdminShell membership={membership} />
}
