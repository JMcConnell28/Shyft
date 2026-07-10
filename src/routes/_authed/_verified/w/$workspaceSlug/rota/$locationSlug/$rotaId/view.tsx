import { createFileRoute } from "@tanstack/react-router"

import { WorkspaceRotaDetailPage } from "@/features/rota/components/workspace-rota-detail-page"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/rota/$locationSlug/$rotaId/view",
)({
  head: () => ({
    meta: [
      { title: "Published Rota | RocketRota" },
      {
        name: "description",
        content: "View the published weekly rota in RocketRota.",
      },
    ],
  }),
  component: RotaViewRoute,
})

function RotaViewRoute() {
  const { viewer } = Route.useRouteContext()
  const params = Route.useParams()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace || activeWorkspace.type !== "organization") {
    throw new Error("An organization workspace is required for this rota route.")
  }

  return (
    <WorkspaceRotaDetailPage
      locationSlug={params.locationSlug}
      publishedOnly
      rotaId={params.rotaId}
      userId={viewer.user.id}
      workspace={activeWorkspace}
    />
  )
}
