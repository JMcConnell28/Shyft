import { createFileRoute, redirect } from "@tanstack/react-router"

import { getWorkspaceAccountPath } from "@/lib/organization-paths"
import { loadDefaultViewer } from "@/features/navigation/load-navigation-context"

export const Route = createFileRoute("/_authed/_verified/account")({
  beforeLoad: async ({ context }) => {
    const { activeWorkspace } = await loadDefaultViewer(context)

    if (activeWorkspace) {
      throw redirect({
        to: getWorkspaceAccountPath(activeWorkspace.slug),
      })
    }

    throw redirect({ to: "/dashboard" })
  },
})
