import { createFileRoute, redirect } from "@tanstack/react-router"

import { getWorkspaceAccountPath } from "@/lib/organization-paths"

export const Route = createFileRoute("/_authed/_verified/account")({
  beforeLoad: ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (activeWorkspace) {
      throw redirect({
        to: getWorkspaceAccountPath(activeWorkspace.slug),
      })
    }

    throw redirect({ to: "/dashboard" })
  },
})
