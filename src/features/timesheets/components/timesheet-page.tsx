"use client"

import type { TimesheetScopeInput } from "@/features/timesheets/types"
import { Card, CardContent } from "@/components/ui/card"
import { DesktopTimesheetView } from "@/features/timesheets/components/desktop-timesheet-view"
import { MobileTimesheetView } from "@/features/timesheets/components/mobile-timesheet-view"
import { useTimesheetQuery } from "@/features/timesheets/hooks/use-timesheet-query"

function TimesheetPage({
  input,
  workspaceSlug,
}: {
  input: TimesheetScopeInput
  workspaceSlug: string
}) {
  const query = useTimesheetQuery(input)

  if (query.isPending) {
    return (
      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-5">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  const data = query.data

  if (!data) {
    return (
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-5 text-sm text-muted-foreground">
            No timesheet data is available yet.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-5 text-sm text-muted-foreground">
            We could not load timesheets.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <MobileTimesheetView
        data={data}
        input={input}
        workspaceSlug={workspaceSlug}
      />
      <DesktopTimesheetView
        data={data}
        input={input}
        workspaceSlug={workspaceSlug}
      />
    </>
  )
}

export { TimesheetPage }
