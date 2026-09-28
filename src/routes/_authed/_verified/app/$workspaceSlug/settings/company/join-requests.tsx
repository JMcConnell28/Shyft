import { createFileRoute, useLocation } from "@tanstack/react-router"
import { PendingJoinRequestsPage } from "@/features/join-approvals/components/pending-join-requests-page"
import { pendingJoinRequestsQueryOptions } from "@/features/join-approvals/query-options"
import { SettingsLayout } from "@/features/settings/components/settings-layout"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/company/join-requests"
)({
  loader: ({ context }) => {
    const workspace = context.viewer.activeWorkspace
    if (!workspace) throw new Error("An active workspace is required.")
    return context.queryClient.ensureQueryData(
      pendingJoinRequestsQueryOptions(workspace.id)
    )
  },
  head: () => ({ meta: [{ title: "Join requests | RocketRota" }] }),
  component: JoinRequestsRoute,
})

function JoinRequestsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const activePath = useLocation({ select: (location) => location.pathname })
  const workspace = viewer.activeWorkspace
  if (!workspace) throw new Error("An active workspace is required.")

  return (
    <SettingsLayout workspaceSlug={workspaceSlug} activePath={activePath}>
      <PendingJoinRequestsPage organizationId={workspace.id} />
    </SettingsLayout>
  )
}
