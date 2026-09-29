import { createFileRoute, redirect } from "@tanstack/react-router"

import { CustomerSupportThread } from "@/features/support/components/customer-support-thread"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/support/$threadId"
)({
  beforeLoad: ({ context }) => {
    if (!context.capabilities.canUseSupport)
      throw redirect({ to: "/dashboard" })
  },
  component: SupportThreadRoute,
})

function SupportThreadRoute() {
  const { viewer } = Route.useRouteContext()
  const { threadId } = Route.useParams()
  const workspace = viewer.activeWorkspace
  if (!workspace) throw new Error("An active workspace is required.")
  return (
    <CustomerSupportThread
      organizationId={workspace.id}
      threadId={threadId}
      workspaceSlug={workspace.slug}
    />
  )
}
