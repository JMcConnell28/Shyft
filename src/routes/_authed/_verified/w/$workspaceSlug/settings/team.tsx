import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/team"
)({ component: () => <Outlet /> })
