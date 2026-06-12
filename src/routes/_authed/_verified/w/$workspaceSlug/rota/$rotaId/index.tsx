import { createFileRoute } from "@tanstack/react-router"

import { WorkspaceRotaDetailPage } from "@/features/rota/components/workspace-rota-detail-page"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/rota/$rotaId/",
)({
  component: RotaEditRoute,
})

function RotaEditRoute() {
  const { viewer } = Route.useRouteContext()
  const params = Route.useParams()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace || activeWorkspace.type !== "location") {
    throw new Error("A location workspace is required for this rota route.")
  }

  return (
    <WorkspaceRotaDetailPage
      publishedOnly={false}
      rotaId={params.rotaId}
      userId={viewer.user.id}
      workspace={activeWorkspace}
    />
  )
}
