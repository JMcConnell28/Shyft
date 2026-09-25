import { createFileRoute } from "@tanstack/react-router"

import { RotaWorkspaceSkeleton } from "@/features/rota/components/rota-workspace-skeleton"
import { RotaWorkspaceRouteError } from "@/features/rota/components/rota-workspace-route-error"
import { loadRotaWorkspace } from "@/features/rota/load-rota-workspace"

import { WorkspaceRotaDetailPage } from "@/features/rota/components/workspace-rota-detail-page"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/rota/$locationSlug/$rotaId/"
)({
  // Let TanStack Query own data freshness, including intent preloads.
  staleTime: 0,
  preloadStaleTime: 0,
  pendingMs: 150,
  pendingMinMs: 0,
  pendingComponent: RotaWorkspaceSkeleton,
  errorComponent: RotaWorkspaceRouteError,
  loader: ({ context, params }) =>
    loadRotaWorkspace(context.queryClient, {
      workspace: context.viewer.activeWorkspace,
      userId: context.viewer.user.id,
      rotaId: params.rotaId,
      locationSlug: params.locationSlug,
      publishedOnly: false,
    }),
  component: RotaEditRoute,
})

function RotaEditRoute() {
  const { viewer } = Route.useRouteContext()
  const params = Route.useParams()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error(
      "An organization workspace is required for this rota route."
    )
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
