import { createFileRoute } from "@tanstack/react-router"

import { AccountLayout } from "@/features/account/components/account-layout"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/account"
)({
  component: AccountRoute,
})

function AccountRoute() {
  const { workspaceSlug } = Route.useParams()
  return <AccountLayout workspaceSlug={workspaceSlug} />
}
