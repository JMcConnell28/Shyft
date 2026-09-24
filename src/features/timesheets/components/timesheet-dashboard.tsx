"use client"

import * as React from "react"

import type {
  TimesheetPageData,
  TimesheetScopeInput,
  TimesheetViewMode,
} from "@/features/timesheets/types"
import { MyTimesheetView } from "@/features/timesheets/components/my-timesheet-view"
import { TeamTimesheetView } from "@/features/timesheets/components/team-timesheet-view"
import { TimesheetHeader } from "@/features/timesheets/components/timesheet-header"

function TimesheetDashboard({
  data,
  input,
  workspaceSlug,
}: {
  data: TimesheetPageData
  input: TimesheetScopeInput
  workspaceSlug: string
}) {
  const canViewTeam = data.canManage && data.managerTimesheet !== null
  const [activeView, setActiveView] = React.useState<TimesheetViewMode>(
    canViewTeam ? "team" : "mine"
  )

  React.useEffect(() => {
    if (!canViewTeam) setActiveView("mine")
  }, [canViewTeam])

  return (
    <main className="flex flex-1 bg-[#f6f8fc] px-4 py-5 text-[#10204b] sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-4 sm:gap-5">
        <TimesheetHeader
          activeView={activeView}
          canViewTeam={canViewTeam}
          data={data}
          input={input}
          onViewChange={setActiveView}
          workspaceSlug={workspaceSlug}
        />
        {activeView === "team" && data.managerTimesheet ? (
          <TeamTimesheetView
            input={input}
            timesheet={data.managerTimesheet}
            writableLocationIds={data.writableLocationIds}
          />
        ) : (
          <MyTimesheetView timesheet={data.employeeTimesheet} />
        )}
      </div>
    </main>
  )
}

export { TimesheetDashboard }
