"use client"

import type { TimesheetScopeInput } from "@/features/timesheets/types"
import { TimesheetDashboard } from "@/features/timesheets/components/timesheet-dashboard"
import { TimesheetPanel } from "@/features/timesheets/components/timesheet-panel"
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
      <div className="flex flex-1 flex-col gap-4 bg-[#f6f8fc] p-4 sm:p-6">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="h-48 animate-pulse rounded-2xl bg-white" />
      </div>
    )
  }

  if (query.isError) {
    return <TimesheetMessage>We could not load timesheets.</TimesheetMessage>
  }

  return (
    <TimesheetDashboard
      data={query.data}
      input={input}
      workspaceSlug={workspaceSlug}
    />
  )
}

function TimesheetMessage({ children }: { children: string }) {
  return (
    <div className="flex flex-1 bg-[#f6f8fc] p-4 sm:p-6">
      <TimesheetPanel className="m-auto w-full max-w-lg p-6 text-center text-sm font-medium text-[#68769a]">
        {children}
      </TimesheetPanel>
    </div>
  )
}

export { TimesheetPage }
