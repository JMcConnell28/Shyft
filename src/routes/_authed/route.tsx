import { Outlet, createFileRoute } from "@tanstack/react-router"

import { loadNavigationSession } from "@/features/navigation/load-navigation-context"

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context, location }) => ({
    navigationSession: await loadNavigationSession(
      context.queryClient,
      location.href
    ),
  }),
  component: Outlet,
})
