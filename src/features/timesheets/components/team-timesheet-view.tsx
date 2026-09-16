"use client"

import * as React from "react"
import { SearchIcon, UsersRoundIcon } from "lucide-react"

import type {
  ManagerTimesheet,
  TimesheetEntry,
  TimesheetScopeInput,
} from "@/features/timesheets/types"
import type { TeamTimesheetStatusFilter } from "@/features/timesheets/utils/timesheet-view.types"
import { EditTimesheetEntryDialog } from "@/features/timesheets/components/edit-timesheet-entry-dialog"
import { TeamTimesheetTable } from "@/features/timesheets/components/team-timesheet-table"
import { TeamTimesheetMetrics } from "@/features/timesheets/components/timesheet-metrics"
import {
  TimesheetPanel,
  TimesheetPanelHeader,
  TimesheetPill,
} from "@/features/timesheets/components/timesheet-panel"
import { filterTeamTimesheetEmployees } from "@/features/timesheets/utils/timesheet-view"

function TeamTimesheetView({
  input,
  timesheet,
}: {
  input: TimesheetScopeInput
  timesheet: ManagerTimesheet
}) {
  const [search, setSearch] = React.useState("")
  const [location, setLocation] = React.useState("all")
  const [status, setStatus] = React.useState<TeamTimesheetStatusFilter>("all")
  const [expandedEmployeeId, setExpandedEmployeeId] = React.useState("")
  const [selectedEntry, setSelectedEntry] =
    React.useState<TimesheetEntry | null>(null)
  const locations = Array.from(
    new Set(timesheet.employees.flatMap((employee) => employee.locations))
  ).sort()
  const employees = filterTeamTimesheetEmployees(timesheet.employees, {
    location,
    search,
    status,
  })

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <TeamTimesheetMetrics timesheet={timesheet} />
      <TimesheetPanel>
        <TimesheetPanelHeader
          action={
            <TimesheetPill>
              {employees.length} employee{employees.length === 1 ? "" : "s"}
            </TimesheetPill>
          }
          icon={UsersRoundIcon}
          subtitle="Open an employee to review or adjust their entries"
          title="Team hours"
        />
        <div className="grid gap-2 border-b border-[#edf0f6] p-3 sm:grid-cols-[minmax(13rem,1fr)_12rem_11rem] sm:p-4">
          <label className="relative">
            <span className="sr-only">Search employees</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8792ad]" />
            <input
              className="h-10 w-full rounded-xl border border-[#dfe4ef] bg-white pr-3 pl-9 text-sm font-medium transition outline-none placeholder:text-[#9aa4ba] focus:border-[#236cff] focus:ring-2 focus:ring-blue-100"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees"
              value={search}
            />
          </label>
          <FilterSelect
            label="Location"
            onChange={setLocation}
            options={[
              { label: "All locations", value: "all" },
              ...locations.map((item) => ({ label: item, value: item })),
            ]}
            value={location}
          />
          <FilterSelect
            label="Status"
            onChange={(value) => setStatus(value as TeamTimesheetStatusFilter)}
            options={[
              { label: "All statuses", value: "all" },
              { label: "Ready", value: "ready" },
              { label: "Open entry", value: "open" },
              { label: "Needs review", value: "attention" },
            ]}
            value={status}
          />
        </div>
        <TeamTimesheetTable
          employees={employees}
          expandedEmployeeId={expandedEmployeeId}
          onEdit={setSelectedEntry}
          onToggle={(employeeId) =>
            setExpandedEmployeeId((current) =>
              current === employeeId ? "" : employeeId
            )
          }
        />
      </TimesheetPanel>
      <EditTimesheetEntryDialog
        entry={selectedEntry}
        input={input}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null)
        }}
      />
    </div>
  )
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        className="h-10 w-full rounded-xl border border-[#dfe4ef] bg-white px-3 text-sm font-semibold text-[#46577d] outline-none focus:border-[#236cff] focus:ring-2 focus:ring-blue-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export { TeamTimesheetView }
