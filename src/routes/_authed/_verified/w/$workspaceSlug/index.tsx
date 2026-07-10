import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/_verified/w/$workspaceSlug/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/w/$workspaceSlug/dashboard",
      params: {
        workspaceSlug: params.workspaceSlug,
      },
    })
  },
})
