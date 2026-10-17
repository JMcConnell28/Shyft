import { createFileRoute } from "@tanstack/react-router"

import { ShiftOverviewCards } from "@/features/dashboard/components/shift-overview-cards"
import { DashboardWelcomeModal } from "@/features/dashboard/components/dashboard-welcome-modal"
import { ManagerDashboard } from "@/features/dashboard/manager/components/manager-dashboard"
import { managerDashboardSearchSchema } from "@/features/dashboard/manager/schemas"
import { loadDashboardAccess } from "@/features/dashboard/manager/load-dashboard-access"
import { dashboardWelcomeQueryOptions } from "@/features/dashboard/query-options"
import {
  DashboardRouteError,
  ManagerDashboardLoading,
} from "@/features/dashboard/manager/components/dashboard-state"
import { dashboardAnnouncementsQueryOptions } from "@/features/announcements/query-options"
import { getDashboardShiftOverview } from "@/features/dashboard/server-fns"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/dashboard"
)({
  pendingMs: 150,
  pendingMinMs: 0,
  pendingComponent: ManagerDashboardLoading,
  errorComponent: DashboardRouteError,
  validateSearch: (search) => managerDashboardSearchSchema.parse(search),
  staleTime: 0,
  preloadStaleTime: 0,
  loaderDeps: ({ search }) => ({
    location: search.location,
    date: search.date,
  }),
  loader: async ({ context, deps }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      throw new Error("An active workspace is required.")
    }

    const announcementInput = {
      organizationId: activeWorkspace.id,
      userId: context.viewer.user.id,
    }
    const welcomePromise = context.queryClient.ensureQueryData(
      dashboardWelcomeQueryOptions(
        { id: activeWorkspace.id, type: activeWorkspace.type },
        context.viewer.user.id
      )
    )

    if (
      context.capabilities.canManageRota ||
      context.capabilities.canManageTimeClock
    ) {
      const [, welcome] = await Promise.all([
        loadDashboardAccess(
          context.queryClient,
          activeWorkspace.id,
          context.viewer.user.id,
          deps
        ),
        welcomePromise,
      ])
      return { mode: "manager" as const, welcome }
    }

    const [announcements, overview, welcome] = await Promise.all([
      context.queryClient.ensureQueryData(
        dashboardAnnouncementsQueryOptions(announcementInput)
      ),
      getDashboardShiftOverview({
        data: announcementInput,
      }),
      welcomePromise,
    ])

    return { mode: "employee" as const, announcements, overview, welcome }
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
      <DashboardWelcomeModal
        capabilities={context.capabilities}
        initiallyOpen={result.welcome.shouldShow}
        userName={context.viewer.user.name}
        userId={context.viewer.user.id}
        workspace={activeWorkspace}
      />

      {result.mode === "manager" ? (
        <ManagerDashboard
          organizationId={activeWorkspace.id}
          userId={context.viewer.user.id}
          workspaceSlug={activeWorkspace.slug}
          search={search}
          onSearch={(value) => {
            void navigate({ search: value })
          }}
        />
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-0 md:p-4 lg:p-5">
          <ShiftOverviewCards
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
    </div>
  )
}
