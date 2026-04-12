import { createFileRoute, redirect } from "@tanstack/react-router"

import { getOrganizationDashboardPath } from "@/lib/organization-paths"

export const Route = createFileRoute("/_authed/_verified/o/$orgSlug/")({
  loader: async ({ params }) => {
    throw redirect({
      href: getOrganizationDashboardPath(params.orgSlug),
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return null
}
