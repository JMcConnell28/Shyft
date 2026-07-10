import { createFileRoute, redirect } from "@tanstack/react-router"

import { CreateOrganizationPage } from "@/features/onboarding/components/create-organization-page"
import { getExistingOrganizationRedirect } from "@/features/onboarding/utils/viewer-route-redirects"

export const Route = createFileRoute("/_authed/_verified/onboarding/org")({
  beforeLoad: ({ context }) => {
    const redirectTarget = getExistingOrganizationRedirect(context.viewer)

    if (redirectTarget) {
      throw redirect({ href: redirectTarget })
    }
  },
  head: () => ({
    meta: [
      { title: "Create Organization | RocketRota" },
      {
        name: "description",
        content: "Create your RocketRota organization and choose its URL slug.",
      },
    ],
  }),
  component: CreateOrganizationPage,
})
