import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { getViewerState } from "@/lib/onboarding"

export const Route = createFileRoute("/_authed")({
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

    return { viewer }
  },
  component: Outlet,
})
