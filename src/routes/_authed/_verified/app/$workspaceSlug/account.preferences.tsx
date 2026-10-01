import { createFileRoute } from "@tanstack/react-router"

import { AccountPreferencesPage } from "@/features/account/components/account-preferences-page"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/account/preferences"
)({
  head: () => ({ meta: [{ title: "Preferences | RocketRota" }] }),
  component: PreferencesRoute,
})

function PreferencesRoute() {
  const { viewer } = Route.useRouteContext()
  return <AccountPreferencesPage userId={viewer.user.id} />
}
