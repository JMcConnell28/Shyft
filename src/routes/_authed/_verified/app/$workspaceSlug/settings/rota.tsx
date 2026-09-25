import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/rota"
)({ component: () => <Outlet /> })
