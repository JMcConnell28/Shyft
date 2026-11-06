import { dashboardTeamColumns } from "../constants"
import { ManagerTeamFilters } from "./team-filters"
import { DashboardTeamRow } from "./team-row"
import type { ManagerDayData, TeamRow } from "../types"
import type { useTeamFilters } from "../hooks/use-team-filters"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DashboardPanel,
  DashboardPanelHeader,
} from "@/features/dashboard/components/dashboard-layout"

function ManagerTeamSection({
  data,
  filters,
  workspaceSlug,
  canManageRota,
  onClock,
  onReview,
}: {
  data: ManagerDayData
  filters: ReturnType<typeof useTeamFilters>
  workspaceSlug: string
  canManageRota: boolean
  onClock: (row: TeamRow, action: "clock_in" | "clock_out") => void
  onReview: (row: TeamRow) => void
}) {
  return (
    <DashboardPanel
      id="dashboard-team"
      aria-labelledby="team-heading"
      tabIndex={-1}
      className="@container/team scroll-mt-4"
    >
      <DashboardPanelHeader
        headingId="team-heading"
        title={data.isToday ? "Today’s team" : "Team"}
        description={data.location.name}
        action={
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium tabular-nums">
            {filters.total} results
          </span>
        }
      />
      <ManagerTeamFilters
        filters={filters}
        attendanceEnabled={data.location.attendanceEnabled}
      />
      {filters.rows.length ? (
        <div role="table" aria-labelledby="team-heading">
          <div
            role="row"
            className={cn(
              "sr-only @2xl/team:not-sr-only @2xl/team:grid @2xl/team:items-center @2xl/team:gap-3 @2xl/team:border-t @2xl/team:bg-muted/25 @2xl/team:px-5 @2xl/team:py-3 @2xl/team:text-xs @2xl/team:font-medium @2xl/team:text-muted-foreground",
              data.location.attendanceEnabled
                ? dashboardTeamColumns.attendance
                : dashboardTeamColumns.published
            )}
          >
            <span role="columnheader">Employee</span>
            <span role="columnheader">Scheduled</span>
            {data.location.attendanceEnabled ? (
              <span role="columnheader">Attendance</span>
            ) : null}
            <span role="columnheader">Status</span>
            <span role="columnheader" className="sr-only">
              Actions
            </span>
          </div>
          <div role="rowgroup">
            {filters.rows.map((row) => (
              <DashboardTeamRow
                key={row.key}
                row={row}
                location={data.location}
                isToday={data.isToday}
                workspaceSlug={workspaceSlug}
                canManageRota={canManageRota}
                isClockedIn={Boolean(
                  data.clockEmployees.find(
                    (employee) => employee.id === row.employeeId
                  )?.openEntry
                )}
                onClock={onClock}
                onReview={onReview}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-2 border-t px-4 py-3">
          <p role="status" className="text-sm text-muted-foreground">
            {data.team.length
              ? "No employees match these filters."
              : data.isToday
                ? "No team members today"
                : "No team members for this day"}
          </p>
          {data.team.length ? (
            <Button variant="link" onClick={filters.reset}>
              Clear filters
            </Button>
          ) : null}
        </div>
      )}
      {filters.total > filters.pageSize ? (
        <div className="flex items-center justify-end gap-2 border-t p-3 text-xs">
          <Button
            variant="outline"
            disabled={filters.page === 1}
            onClick={() => filters.setPage(filters.page - 1)}
          >
            Previous
          </Button>
          <span>
            {filters.page} / {Math.ceil(filters.total / filters.pageSize)}
          </span>
          <Button
            variant="outline"
            disabled={filters.page * filters.pageSize >= filters.total}
            onClick={() => filters.setPage(filters.page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </DashboardPanel>
  )
}
export { ManagerTeamSection }
