"use client"

import type { TimesheetScopeInput } from "@/features/timesheets/types"
import { Button } from "@/components/ui/button"
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
      <div
        role="status"
        aria-label="Loading Timesheets"
        className="flex flex-1 flex-col gap-4 bg-[#f6f8fc] p-4 sm:p-6"
      >
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="h-48 animate-pulse rounded-2xl bg-white" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <TimesheetMessage
        pending={query.isFetching}
        onRetry={() => void query.refetch()}
      >
        We could not load timesheets.
      </TimesheetMessage>
    )
  }

  return (
    <TimesheetDashboard
      data={query.data}
      input={input}
      workspaceSlug={workspaceSlug}
    />
  )
}

function TimesheetMessage({
  children,
  pending,
  onRetry,
}: {
  children: string
  pending: boolean
  onRetry: () => void
}) {
  return (
    <div role="alert" className="flex flex-1 bg-[#f6f8fc] p-4 sm:p-6">
      <TimesheetPanel className="m-auto w-full max-w-lg p-6 text-center text-sm font-medium text-[#68769a]">
        {children}
        <Button
          className="mx-auto mt-4"
          variant="outline"
          disabled={pending}
          onClick={onRetry}
        >
          {pending ? "Retrying…" : "Try again"}
        </Button>
      </TimesheetPanel>
    </div>
  )
}

export { TimesheetPage }
