import { createFileRoute } from "@tanstack/react-router"

import { TimesheetPage } from "@/features/timesheets/components/timesheet-page"
import { timesheetQueryOptions } from "@/features/timesheets/query-options"
import { timesheetSearchSchema } from "@/features/timesheets/schemas/timesheet-search-schema"
import { TimeAttendanceSetupPrompt } from "@/features/time-clock/components/time-attendance-setup-prompt"
import { needsTimeAttendanceSetup } from "@/features/time-clock/utils/time-attendance-access"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/timesheets"
)({
  staleTime: 0,
  preloadStaleTime: 0,
  validateSearch: (search) => timesheetSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ weekStart: search.weekStart }),
  loader: async ({ context, deps }) => {
    const workspace = context.viewer.activeWorkspace

    if (!workspace) {
      throw new Error("An active workspace is required.")
    }

    if (needsTimeAttendanceSetup(context.viewer.billing))
      return { setupRequired: true }

    await context.queryClient.ensureQueryData({
      ...timesheetQueryOptions({
        organizationId: workspace.id,
        userId: context.viewer.user.id,
        weekStart: deps.weekStart,
      }),
      revalidateIfStale: true,
    })
    return { setupRequired: false }
  },
  component: WorkspaceTimesheetsRoute,
})

function WorkspaceTimesheetsRoute() {
  const { viewer } = Route.useRouteContext()
  const search = Route.useSearch()
  const { setupRequired } = Route.useLoaderData()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required.")
  }

  if (setupRequired) {
    return (
      <TimeAttendanceSetupPrompt
        workspaceSlug={activeWorkspace.slug}
        canActivate={viewer.activeRole === "owner"}
      />
    )
  }

  const input = {
    organizationId: activeWorkspace.id,
    userId: viewer.user.id,
    weekStart: search.weekStart,
  }

  return <TimesheetPage input={input} workspaceSlug={activeWorkspace.slug} />
}
