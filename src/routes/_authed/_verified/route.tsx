import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { getViewerState } from "@/lib/onboarding"

export const Route = createFileRoute("/_authed/_verified")({
  beforeLoad: async ({ location }) => {
    const viewer = await getViewerState()

    if (!viewer) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }

    if (!viewer.user.emailVerified) {
      throw redirect({
        to: "/verify-email",
        search: {
          email: viewer.user.email,
          redirect: location.href,
          sent: false,
        },
      })
    }

    return { viewer }
  },
  component: Outlet,
})
