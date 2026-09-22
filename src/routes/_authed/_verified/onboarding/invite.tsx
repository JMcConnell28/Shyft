import { createFileRoute, redirect } from "@tanstack/react-router"

import { InviteTeamPage } from "@/features/onboarding/components/invite-team-page"
import { getPendingOnboardingPath } from "@/features/onboarding/utils/viewer-route-redirects"

import { loadDefaultViewer } from "@/features/navigation/load-navigation-context"

export const Route = createFileRoute("/_authed/_verified/onboarding/invite")({
  beforeLoad: async ({ context }) => {
    const viewer = await loadDefaultViewer(context)

    if (!viewer.activeOrganization && !viewer.activeWorkspace) {
      throw redirect({ to: "/dashboard" })
    }

    const pendingOnboardingPath = getPendingOnboardingPath(viewer)

    if (pendingOnboardingPath === "/onboarding/location") {
      throw redirect({ to: pendingOnboardingPath })
    }
    return { viewer }
  },
  head: () => ({
    meta: [
      { title: "Invite Your Team | RocketRota" },
      {
        name: "description",
        content:
          "Generate the first reusable staff invite link for your organization.",
      },
    ],
  }),
  component: InviteTeamRoute,
})

function InviteTeamRoute() {
  const { viewer } = Route.useRouteContext()

  return <InviteTeamPage viewer={viewer} />
}
