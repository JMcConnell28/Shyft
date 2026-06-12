import { createFileRoute } from "@tanstack/react-router"

import { ShiftOverviewCards } from "@/features/dashboard/components/shift-overview-cards"
import { DashboardWelcomeModal } from "@/features/dashboard/components/dashboard-welcome-modal"
import {
  getDashboardShiftOverview,
  getDashboardWelcome,
} from "@/features/dashboard/server-fns"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/dashboard"
)({
  loader: async ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      throw new Error("An active workspace is required.")
    }

    const [overview, welcome] = await Promise.all([
      getDashboardShiftOverview({
        data:
          activeWorkspace.type === "organization"
            ? {
                organizationId: activeWorkspace.id,
                userId: context.viewer.user.id,
              }
            : {
                organizationId: null,
                locationId: activeWorkspace.id,
                userId: context.viewer.user.id,
              },
      }),
      getDashboardWelcome({
        data: {
          id: activeWorkspace.id,
          type: activeWorkspace.type,
        },
      }),
    ])

    return { overview, welcome }
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
  const { overview, welcome } = Route.useLoaderData()
  const activeWorkspace = context.viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required.")
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-0 md:p-5">
      <div className="flex justify-end px-4 pt-3 md:items-start md:px-0 md:pt-0">
        <div className="mr-auto hidden space-y-1 md:block">
          <h2 className="text-base font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Your next shift and published shifts for this week.
          </p>
        </div>
        <DashboardWelcomeModal
          capabilities={context.capabilities}
          initiallyOpen={welcome.shouldShow}
          userName={context.viewer.user.name}
          workspace={activeWorkspace}
        />
      </div>

      <ShiftOverviewCards
        mobileContext={{
          userName: context.viewer.user.name,
          workspaceName: activeWorkspace.name,
          workspaceSlug: activeWorkspace.slug,
          workspaceType: activeWorkspace.type,
        }}
        overview={overview}
      />
    </div>
  )
}
