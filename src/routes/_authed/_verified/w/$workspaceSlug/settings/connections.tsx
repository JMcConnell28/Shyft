import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/connections"
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/w/$workspaceSlug/settings/general",
      params: { workspaceSlug: params.workspaceSlug },
    })
  },
})
