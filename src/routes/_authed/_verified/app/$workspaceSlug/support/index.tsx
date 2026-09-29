import { createFileRoute, redirect } from "@tanstack/react-router"

import { CustomerSupportPage } from "@/features/support/components/customer-support-page"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/support/"
)({
  beforeLoad: ({ context }) => {
    if (!context.capabilities.canUseSupport)
      throw redirect({ to: "/dashboard" })
  },
  component: SupportRoute,
})

function SupportRoute() {
  const { viewer } = Route.useRouteContext()
  const workspace = viewer.activeWorkspace
  if (!workspace) throw new Error("An active workspace is required.")
  return (
    <CustomerSupportPage
      organizationId={workspace.id}
      workspaceSlug={workspace.slug}
    />
  )
}
