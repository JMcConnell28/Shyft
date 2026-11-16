import { createFileRoute, redirect } from "@tanstack/react-router"
import { Suspense, lazy } from "react"

import { legacyDashboardSearchSchema } from "@/features/dashboard/schemas/dashboard-search"
import { canViewManagerDashboard } from "@/features/dashboard/manager/capabilities"
import { loadDashboard } from "@/features/dashboard/load-dashboard"
import { WorkspaceRouteError } from "@/features/navigation/components/workspace-route-error"
import { WorkspaceRoutePending } from "@/features/navigation/components/workspace-route-pending"

const PersonalDashboard = lazy(() =>
  import("@/features/dashboard/components/personal-dashboard").then(
    (module) => ({
      default: module.PersonalDashboard,
    })
  )
)
const DashboardWelcome = lazy(() =>
  import("@/features/dashboard/components/dashboard-welcome").then(
    (module) => ({
      default: module.DashboardWelcome,
    })
  )
)

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/dashboard"
)({
  pendingMs: 150,
  pendingMinMs: 0,
  pendingComponent: WorkspaceRoutePending,
  errorComponent: WorkspaceRouteError,
  validateSearch: (search) => legacyDashboardSearchSchema.parse(search),
  beforeLoad: ({ context, params, search }) => {
    if (
      search.view === "manager" &&
      canViewManagerDashboard(context.capabilities)
    ) {
      throw redirect({
        to: "/app/$workspaceSlug/manage",
        params,
        search: { location: search.location, date: search.date },
        replace: true,
      })
    }
  },
  staleTime: 0,
  preloadStaleTime: 0,
  loader: ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      throw new Error("An active workspace is required.")
    }

    return loadDashboard({
      queryClient: context.queryClient,
      workspace: activeWorkspace,
      userId: context.viewer.user.id,
    })
  },
  head: () => ({
    meta: [
      { title: "Dashboard | RocketRota" },
      {
        name: "description",
        content: "Your active RocketRota workspace dashboard.",
      },
    ],
  }),
  component: DashboardWorkspaceRoute,
})

function DashboardWorkspaceRoute() {
  const context = Route.useRouteContext()
  const result = Route.useLoaderData()
  const activeWorkspace = context.viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required.")
  }

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <DashboardWelcome
          capabilities={context.capabilities}
          userName={context.viewer.user.name}
          userId={context.viewer.user.id}
          workspace={activeWorkspace}
        />
      </Suspense>

      <Suspense fallback={<WorkspaceRoutePending />}>
        <div className="flex flex-1 flex-col">
          <PersonalDashboard
            input={{
              organizationId: activeWorkspace.id,
              userId: context.viewer.user.id,
            }}
            organizationName={activeWorkspace.name}
            announcements={result.announcements}
            mobileContext={{
              userName: context.viewer.user.name,
              workspaceSlug: activeWorkspace.slug,
              workspaceType: activeWorkspace.type,
            }}
            overview={result.overview}
          />
        </div>
      </Suspense>
    </div>
  )
}
