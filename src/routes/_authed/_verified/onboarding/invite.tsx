import { createFileRoute, getRouteApi, redirect } from "@tanstack/react-router"

import { InviteTeamPage } from "@/features/onboarding/components/invite-team-page"
import { getPendingOnboardingPath } from "@/features/onboarding/utils/viewer-route-redirects"

const verifiedRouteApi = getRouteApi("/_authed/_verified")

export const Route = createFileRoute("/_authed/_verified/onboarding/invite")({
  beforeLoad: ({ context }) => {
    const viewer = context.viewer

    if (!viewer.activeOrganization && !viewer.activeWorkspace) {
      throw redirect({ to: "/dashboard" })
    }

    const pendingOnboardingPath = getPendingOnboardingPath(viewer)

    if (pendingOnboardingPath === "/onboarding/location") {
      throw redirect({ to: pendingOnboardingPath })
    }
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
  const { viewer } = verifiedRouteApi.useRouteContext()

  return <InviteTeamPage viewer={viewer} />
}
