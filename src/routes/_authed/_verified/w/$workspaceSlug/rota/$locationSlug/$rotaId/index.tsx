import { createFileRoute } from "@tanstack/react-router"

import { WorkspaceRotaDetailPage } from "@/features/rota/components/workspace-rota-detail-page"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/rota/$locationSlug/$rotaId/",
)({
  component: RotaEditRoute,
})

function RotaEditRoute() {
  const { viewer } = Route.useRouteContext()
  const params = Route.useParams()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace || activeWorkspace.type !== "organization") {
    throw new Error("An organization workspace is required for this rota route.")
  }

  return (
    <WorkspaceRotaDetailPage
      locationSlug={params.locationSlug}
      publishedOnly={false}
      rotaId={params.rotaId}
      userId={viewer.user.id}
      workspace={activeWorkspace}
    />
  )
}
