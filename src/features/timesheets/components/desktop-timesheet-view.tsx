"use client"

import {
  CheckCircle2Icon,
  InfoIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react"

import type {
  TimesheetPageData,
  TimesheetScopeInput,
} from "@/features/timesheets/types"
import { DesktopTimesheetBreakdown } from "@/features/timesheets/components/desktop-timesheet-breakdown"
import {
  DesktopTimesheetPanel,
  DesktopTimesheetPanelHeader,
  DesktopTimesheetPill,
} from "@/features/timesheets/components/desktop-timesheet-panel"
import { DesktopTimesheetSummary } from "@/features/timesheets/components/desktop-timesheet-summary"
import { DesktopTimesheetWeekControls } from "@/features/timesheets/components/desktop-timesheet-week-controls"
import { ManagerTimesheetTable } from "@/features/timesheets/components/manager-timesheet-table"
import { SageTimesheetExportButton } from "@/features/timesheets/components/sage-timesheet-export-button"
import { formatHours } from "@/features/timesheets/utils/timesheet-time"
import { cn } from "@/lib/utils"

type DesktopTimesheetViewProps = {
  data: TimesheetPageData
  input: TimesheetScopeInput
  workspaceSlug: string
}

function DesktopTimesheetView({
  data,
  input,
  workspaceSlug,
}: DesktopTimesheetViewProps) {
  const entryCount = data.employeeTimesheet.days.reduce(
    (total, day) => total + day.entries.length,
    0
  )
  const needsReview =
    data.employeeTimesheet.reviewCount > 0 ||
    data.employeeTimesheet.openEntryCount > 0

  return (
    <div className="hidden flex-1 flex-col bg-[#f7f8fb] px-6 py-6 text-[#11245a] md:flex">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
          <DesktopTimesheetPanel>
            <div className="flex min-h-[7.5rem] items-center justify-between gap-5 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.1em] text-[#7a86a4] uppercase">
                  Timesheets
                </p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.02em] text-[#11245a]">
                  Your hours
                </h1>
                <p className="mt-1 text-sm font-medium text-[#7a86a4]">
                  Worked, payable, and review status for the selected week.
                </p>
              </div>
              <DesktopTimesheetWeekControls
                weekLabel={data.weekLabel}
                weekStart={data.weekStart}
                workspaceSlug={workspaceSlug}
              />
            </div>

            <DesktopTimesheetSummary
              entryCount={entryCount}
              needsReview={needsReview}
              timesheet={data.employeeTimesheet}
            />
          </DesktopTimesheetPanel>

          <TimesheetStatusPanel
            data={data}
            input={input}
            needsReview={needsReview}
          />
        </section>

        <DesktopTimesheetBreakdown
          days={data.employeeTimesheet.days}
          totalPayableMinutes={data.employeeTimesheet.payableMinutes}
        />

        {data.canManage && data.managerTimesheet ? (
          <DesktopTimesheetPanel>
            <DesktopTimesheetPanelHeader
              action={
                <DesktopTimesheetPill>
                  {formatHours(data.managerTimesheet.payableMinutes)} payable
                </DesktopTimesheetPill>
              }
              icon={UsersRoundIcon}
              subtitle={`${data.managerTimesheet.employees.length} employees in this week`}
              title="Team hours"
            />
            <ManagerTimesheetTable
              input={input}
              timesheet={data.managerTimesheet}
            />
          </DesktopTimesheetPanel>
        ) : null}

        <div className="flex items-center justify-between rounded-[14px] border border-[#dfe5f0] bg-card px-4 py-3 text-sm font-medium text-[#7a86a4] shadow-[0_8px_24px_rgba(30,50,96,0.035)]">
          <span className="flex items-center gap-2">
            <InfoIcon className="size-4 text-[#0069ff]" />
            Payable hours include adjustments.
          </span>
        </div>
      </div>
    </div>
  )
}

function TimesheetStatusPanel({
  data,
  input,
  needsReview,
}: {
  data: TimesheetPageData
  input: TimesheetScopeInput
  needsReview: boolean
}) {
  return (
    <DesktopTimesheetPanel>
      <DesktopTimesheetPanelHeader
        action={
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[10px] px-2.5 py-1 text-[11px] font-semibold",
              needsReview
                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                : "bg-[#e7f8f1] text-[#248964]"
            )}
          >
            <CheckCircle2Icon className="size-3.5" />
            {needsReview ? "Needs review" : "Ready"}
          </span>
        }
        icon={UserRoundIcon}
        subtitle="Current employee"
        title={data.employeeTimesheet.employeeName}
      />

      <div className="p-4">
        <p className="rounded-[12px] border border-[#edf0f6] bg-[#fbfcff] px-4 py-3 text-sm font-medium text-[#7a86a4]">
          {needsReview
            ? "Some entries need manager attention before payroll."
            : "Timesheet looks complete for the week."}
        </p>

        {data.canManage && data.managerTimesheet ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-[12px] border border-[#edf0f6] bg-[#fbfcff] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#11245a]">Team week</p>
              <p className="text-xs font-medium text-[#7a86a4]">
                {data.managerTimesheet.employees.length} employees
              </p>
            </div>
            <SageTimesheetExportButton
              input={input}
              rotas={data.exportableRotas}
              size="sm"
              className="h-9 rounded-[10px] text-xs font-semibold"
              disabledReason={
                data.exportableRotas.length === 0
                  ? "No published rota is available for this week."
                  : null
              }
            />
          </div>
        ) : null}
      </div>
    </DesktopTimesheetPanel>
  )
}

export { DesktopTimesheetView }
