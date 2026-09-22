import { createFileRoute, redirect } from "@tanstack/react-router"

import { OrglessWorkspacePage } from "@/components/app/orgless-workspace-page"
import { getOrganizationAppRedirect } from "@/features/onboarding/utils/viewer-route-redirects"

import { loadDefaultViewer } from "@/features/navigation/load-navigation-context"

export const Route = createFileRoute("/_authed/_verified/dashboard")({
  beforeLoad: async ({ context }) => {
    const viewer = await loadDefaultViewer(context)
    if (!viewer.activeWorkspace && viewer.organizations.length === 0) {
      throw redirect({
        to:
          viewer.onboardingIntent === "join"
            ? "/onboarding/join"
            : "/onboarding/setup",
      })
    }

    const redirectTarget = getOrganizationAppRedirect(viewer, "dashboard")

    if (!redirectTarget) {
      return { viewer }
    }

    throw redirect({ href: redirectTarget })
  },
  head: () => ({
    meta: [
      { title: "Dashboard | RocketRota" },
      {
        name: "description",
        content: "Your active RocketRota workspace and organization dashboard.",
      },
    ],
  }),
  component: DashboardRoute,
})

function DashboardRoute() {
  const { viewer } = Route.useRouteContext()

  return <OrglessWorkspacePage organizations={viewer.organizations} />
}
