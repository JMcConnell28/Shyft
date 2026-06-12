import { createFileRoute, redirect } from "@tanstack/react-router"

import { SetupChoicePage } from "@/features/onboarding/components/setup-choice-page"
import { getExistingOrganizationRedirect } from "@/features/onboarding/utils/viewer-route-redirects"

export const Route = createFileRoute("/_authed/_verified/onboarding/setup")({
  beforeLoad: ({ context }) => {
    const redirectTarget = getExistingOrganizationRedirect(context.viewer)

    if (redirectTarget) {
      throw redirect({ href: redirectTarget })
    }
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
  component: SetupChoicePage,
})
