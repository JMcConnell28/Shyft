import { createFileRoute, redirect } from "@tanstack/react-router"
import { Suspense, lazy } from "react"

import { canViewManagerDashboard } from "@/features/dashboard/manager/capabilities"
import { managerDashboardSearchSchema } from "@/features/dashboard/manager/schemas"
import { WorkspaceRouteError } from "@/features/navigation/components/workspace-route-error"
import { WorkspaceRoutePending } from "@/features/navigation/components/workspace-route-pending"

const ManagerDashboard = lazy(() =>
  import("@/features/dashboard/manager/components/manager-dashboard").then(
    (module) => ({ default: module.ManagerDashboard })
  )
)

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/manage"
)({
  pendingMs: 150,
  pendingMinMs: 0,
  pendingComponent: WorkspaceRoutePending,
  errorComponent: WorkspaceRouteError,
  validateSearch: (search) => managerDashboardSearchSchema.parse(search),
  beforeLoad: ({ context, params }) => {
    if (!canViewManagerDashboard(context.capabilities)) {
      throw redirect({
        to: "/app/$workspaceSlug/dashboard",
        params,
        replace: true,
      })
    }
  },
  staleTime: 0,
  preloadStaleTime: 0,
  loaderDeps: ({ search }) => ({
    location: search.location,
    date: search.date,
  }),
  loader: async ({ context, deps }) => {
    const workspace = context.viewer.activeWorkspace
    if (!workspace) throw new Error("An active workspace is required.")

    const { loadDashboardAccess } =
      await import("@/features/dashboard/manager/load-dashboard-access")
    await loadDashboardAccess(
      context.queryClient,
      workspace.id,
      context.viewer.user.id,
      deps
    )
  },
  head: () => ({
    meta: [
      { title: "Manage | RocketRota" },
      {
        name: "description",
        content: "Review staffing, attendance, and upcoming rotas.",
      },
    ],
  }),
  component: ManageWorkspaceRoute,
})

function ManageWorkspaceRoute() {
  const { viewer } = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const workspace = viewer.activeWorkspace
  if (!workspace) throw new Error("An active workspace is required.")

  return (
    <Suspense fallback={<WorkspaceRoutePending />}>
      <ManagerDashboard
        organizationId={workspace.id}
        userId={viewer.user.id}
        workspaceSlug={workspace.slug}
        search={search}
        onSearch={(value) => void navigate({ search: value })}
      />
    </Suspense>
  )
}
