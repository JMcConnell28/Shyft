import { createFileRoute } from "@tanstack/react-router"

import { TimesheetPage } from "@/features/timesheets/components/timesheet-page"
import { timesheetQueryOptions } from "@/features/timesheets/query-options"

type TimesheetsSearch = {
  weekStart?: string
}

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/timesheets"
)({
  validateSearch: (search: Record<string, unknown>): TimesheetsSearch => ({
    weekStart:
      typeof search.weekStart === "string" ? search.weekStart : undefined,
  }),
  loaderDeps: ({ search }) => ({ weekStart: search.weekStart }),
  loader: ({ context, deps }) => {
    const workspace = context.viewer.activeWorkspace

    if (!workspace) {
      throw new Error("An active workspace is required.")
    }

    return context.queryClient.ensureQueryData(
      timesheetQueryOptions(
        workspace.type === "organization"
          ? {
              organizationId: workspace.id,
              userId: context.viewer.user.id,
              weekStart: deps.weekStart,
            }
          : {
              organizationId: workspace.organizationId,
              locationId: workspace.id,
              userId: context.viewer.user.id,
              weekStart: deps.weekStart,
            }
      )
    )
  },
  component: WorkspaceTimesheetsRoute,
})

function WorkspaceTimesheetsRoute() {
  const { viewer } = Route.useRouteContext()
  const search = Route.useSearch()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required.")
  }

  const input =
    activeWorkspace.type === "organization"
      ? {
          organizationId: activeWorkspace.id,
          userId: viewer.user.id,
          weekStart: search.weekStart,
        }
      : {
          organizationId: activeWorkspace.organizationId,
          locationId: activeWorkspace.id,
          userId: viewer.user.id,
          weekStart: search.weekStart,
        }

  return <TimesheetPage input={input} workspaceSlug={activeWorkspace.slug} />
}
