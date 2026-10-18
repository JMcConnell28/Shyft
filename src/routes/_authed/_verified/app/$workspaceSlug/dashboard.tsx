import { createFileRoute } from "@tanstack/react-router"
import { Suspense, lazy } from "react"

import { DashboardViewTabs } from "@/features/dashboard/components/dashboard-view-tabs"
import { dashboardSearchSchema } from "@/features/dashboard/schemas/dashboard-search"
import { canViewManagerDashboard } from "@/features/dashboard/utils/dashboard-view"
import { loadDashboard } from "@/features/dashboard/load-dashboard"
import { DashboardRouteError } from "@/features/dashboard/manager/components/dashboard-state"
import { WorkspaceRoutePending } from "@/features/navigation/components/workspace-route-pending"

const PersonalDashboard = lazy(() =>
  import("@/features/dashboard/components/personal-dashboard").then(
    (module) => ({
      default: module.PersonalDashboard,
    })
  )
)
const ManagerDashboard = lazy(() =>
  import("@/features/dashboard/manager/components/manager-dashboard").then(
    (module) => ({
      default: module.ManagerDashboard,
    })
  )
)
const DashboardWelcomeModal = lazy(() =>
  import("@/features/dashboard/components/dashboard-welcome-modal").then(
    (module) => ({
      default: module.DashboardWelcomeModal,
    })
  )
)

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/dashboard"
)({
  pendingMs: 150,
  pendingMinMs: 0,
  pendingComponent: WorkspaceRoutePending,
  errorComponent: DashboardRouteError,
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  staleTime: 0,
  preloadStaleTime: 0,
  loaderDeps: ({ search }) => ({
    view: search.view,
    location: search.location,
    date: search.date,
  }),
  loader: async ({ context, deps }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      throw new Error("An active workspace is required.")
    }

    return loadDashboard({
      queryClient: context.queryClient,
      workspace: activeWorkspace,
      userId: context.viewer.user.id,
      capabilities: context.capabilities,
      search: deps,
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
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const activeWorkspace = context.viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required.")
  }

  return (
    <div className="flex flex-1 flex-col">
      {result.welcome.shouldShow ? (
        <Suspense fallback={null}>
          <DashboardWelcomeModal
            capabilities={context.capabilities}
            initiallyOpen={result.welcome.shouldShow}
            userName={context.viewer.user.name}
            userId={context.viewer.user.id}
            workspace={activeWorkspace}
          />
        </Suspense>
      ) : null}

      <DashboardViewTabs
        canManage={canViewManagerDashboard(context.capabilities)}
        view={result.mode === "manager" ? "manager" : "personal"}
        onViewChange={(view) => {
          void navigate({ search: { ...search, view } })
        }}
      >
        <Suspense fallback={<WorkspaceRoutePending />}>
          {result.mode === "manager" ? (
            <ManagerDashboard
              organizationId={activeWorkspace.id}
              userId={context.viewer.user.id}
              workspaceSlug={activeWorkspace.slug}
              search={search}
              onSearch={(value) => {
                void navigate({ search: { view: search.view, ...value } })
              }}
            />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-0 md:p-4 lg:p-5">
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
          )}
        </Suspense>
      </DashboardViewTabs>
    </div>
  )
}
