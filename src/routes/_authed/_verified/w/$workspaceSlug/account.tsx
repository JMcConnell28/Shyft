import { createFileRoute } from "@tanstack/react-router"

import { AccountPage } from "@/features/account/components/account-page"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/account",
)({
  head: () => ({
    meta: [
      { title: "Account | RocketRota" },
      {
        name: "description",
        content: "Manage your RocketRota account details and password.",
      },
    ],
  }),
  component: AccountRoute,
})

function AccountRoute() {
  const { viewer } = Route.useRouteContext()

  return <AccountPage user={viewer.user} />
}
