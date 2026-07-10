import { createFileRoute } from "@tanstack/react-router"

import { ShiftOverviewCards } from "@/features/dashboard/components/shift-overview-cards"
import { DashboardWelcomeModal } from "@/features/dashboard/components/dashboard-welcome-modal"
import { getDashboardAnnouncements } from "@/features/announcements/server-fns"
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

    const announcementInput =
      activeWorkspace.type === "organization"
        ? {
            organizationId: activeWorkspace.id,
            userId: context.viewer.user.id,
          }
        : {
            locationId: activeWorkspace.id,
            userId: context.viewer.user.id,
          }

    const [announcements, overview, welcome] = await Promise.all([
      getDashboardAnnouncements({
        data: announcementInput,
      }),
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

    return { announcements, overview, welcome }
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
  const { announcements, overview, welcome } = Route.useLoaderData()
  const activeWorkspace = context.viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required.")
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-0 md:p-4 lg:p-5">
      <DashboardWelcomeModal
        capabilities={context.capabilities}
        initiallyOpen={welcome.shouldShow}
        userName={context.viewer.user.name}
        workspace={activeWorkspace}
      />

      <ShiftOverviewCards
        announcements={announcements}
        mobileContext={{
          userName: context.viewer.user.name,
          workspaceSlug: activeWorkspace.slug,
          workspaceType: activeWorkspace.type,
        }}
        overview={overview}
      />
    </div>
  )
}
