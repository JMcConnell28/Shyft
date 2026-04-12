import { createFileRoute, getRouteApi, redirect } from "@tanstack/react-router"

import { OrglessWorkspacePage } from "@/components/app/orgless-workspace-page"
import { getOrganizationAppRedirect } from "@/features/onboarding/utils/viewer-route-redirects"

const verifiedRouteApi = getRouteApi("/_authed/_verified")

export const Route = createFileRoute("/_authed/_verified/dashboard")({
  beforeLoad: ({ context }) => {
    const redirectTarget = getOrganizationAppRedirect(context.viewer, "dashboard")

    if (!redirectTarget) {
      return
    }

    throw redirect({ href: redirectTarget })
  },
  head: () => ({
    meta: [
      { title: "Dashboard | Shyft" },
      {
        name: "description",
        content: "Your active Shyft workspace and organization dashboard.",
      },
    ],
  }),
  component: DashboardRoute,
})

function DashboardRoute() {
  const { viewer } = verifiedRouteApi.useRouteContext()

  return <OrglessWorkspacePage organizations={viewer.organizations} />
}
