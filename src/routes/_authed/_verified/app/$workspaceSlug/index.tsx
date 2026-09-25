import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/_verified/app/$workspaceSlug/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/app/$workspaceSlug/dashboard",
      params: {
        workspaceSlug: params.workspaceSlug,
      },
    })
  },
})
