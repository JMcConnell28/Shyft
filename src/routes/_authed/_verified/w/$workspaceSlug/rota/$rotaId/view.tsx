import { createFileRoute } from "@tanstack/react-router"

import { PublishedRotaSkeleton } from "@/features/rota/components/rota-workspace-skeleton"
import { RotaWorkspaceRouteError } from "@/features/rota/components/rota-workspace-route-error"
import { loadRotaWorkspace } from "@/features/rota/load-rota-workspace"

import { WorkspaceRotaDetailPage } from "@/features/rota/components/workspace-rota-detail-page"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/rota/$rotaId/view"
)({
  // Let TanStack Query own data freshness, including intent preloads.
  staleTime: 0,
  preloadStaleTime: 0,
  pendingMs: 150,
  pendingMinMs: 0,
  pendingComponent: PublishedRotaSkeleton,
  errorComponent: RotaWorkspaceRouteError,
  loader: ({ context, params }) =>
    loadRotaWorkspace(context.queryClient, {
      workspace: context.viewer.activeWorkspace,
      workspaceType: "location",
      userId: context.viewer.user.id,
      rotaId: params.rotaId,
      publishedOnly: true,
    }),
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

  if (!activeWorkspace || activeWorkspace.type !== "location") {
    throw new Error("A location workspace is required for this rota route.")
  }

  return (
    <WorkspaceRotaDetailPage
      publishedOnly
      rotaId={params.rotaId}
      userId={viewer.user.id}
      workspace={activeWorkspace}
    />
  )
}
