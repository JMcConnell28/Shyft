import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/company"
)({
  component: WorkspaceCompanySettingsRoute,
})

function WorkspaceCompanySettingsRoute() {
  return <Outlet />
}
