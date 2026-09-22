import { createFileRoute, redirect } from "@tanstack/react-router"

import { getExistingOrganizationRedirect } from "@/features/onboarding/utils/viewer-route-redirects"
import { loadDefaultViewer } from "@/features/navigation/load-navigation-context"

export const Route = createFileRoute("/_authed/_verified/onboarding/setup")({
  beforeLoad: async ({ context }) => {
    const viewer = await loadDefaultViewer(context)
    const redirectTarget = getExistingOrganizationRedirect(viewer)

    if (redirectTarget) {
      throw redirect({ href: redirectTarget })
    }

    throw redirect({ to: "/onboarding/org" })
  },
  head: () => ({
    meta: [
      { title: "Choose Setup | RocketRota" },
      {
        name: "description",
        content: "Choose whether to start with a location or organisation.",
      },
    ],
  }),
  component: () => null,
})
