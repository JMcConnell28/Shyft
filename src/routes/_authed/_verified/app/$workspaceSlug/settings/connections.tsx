import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/connections"
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/app/$workspaceSlug/settings/general",
      params: { workspaceSlug: params.workspaceSlug },
    })
  },
})
