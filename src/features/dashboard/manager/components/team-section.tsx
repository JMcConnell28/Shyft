import { dashboardTeamColumns } from "../constants"
import { ManagerDashboardCard } from "./dashboard-card"
import { ManagerTeamFilters } from "./team-filters"
import { DashboardTeamRow } from "./team-row"
import type { DashboardTeamRowProps, ManagerDayData } from "../types"
import type { useTeamFilters } from "../hooks/use-team-filters"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function ManagerTeamSection({
  data,
  filters,
  workspaceSlug,
  canManageTimesheets,
  onClock,
  onReview,
}: {
  data: ManagerDayData
  filters: ReturnType<typeof useTeamFilters>
  workspaceSlug: string
  canManageTimesheets: boolean
  onClock: DashboardTeamRowProps["onClock"]
  onReview: DashboardTeamRowProps["onReview"]
}) {
  const clockEmployees = new Map(
    data.clockEmployees.map((employee) => [employee.id, employee])
  )

  return (
    <ManagerDashboardCard
      id="dashboard-team"
      headingId="team-heading"
      title={data.isToday ? "Today’s team" : "Team"}
      tabIndex={-1}
      className="@container/team scroll-mt-4"
      action={
        <span className="text-xs font-medium tabular-nums">
          {filters.total} results
        </span>
      }
    >
      <ManagerTeamFilters
        filters={filters}
        attendanceEnabled={data.location.attendanceEnabled}
      />
      {filters.rows.length ? (
        <div role="table" aria-labelledby="team-heading">
          <div
            role="row"
            className={cn(
              "sr-only @min-[39rem]/team:not-sr-only @min-[39rem]/team:grid @min-[39rem]/team:min-h-10 @min-[39rem]/team:items-center @min-[39rem]/team:gap-3 @min-[39rem]/team:border-t @min-[39rem]/team:border-border/60 @min-[39rem]/team:bg-muted/20 @min-[39rem]/team:px-4 @min-[39rem]/team:py-2 @min-[39rem]/team:text-sm @min-[39rem]/team:font-medium @min-[39rem]/team:text-muted-foreground",
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
                canManageTimesheets={canManageTimesheets}
                clockEmployee={clockEmployees.get(row.employeeId)}
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
            <Button variant="secondary" onClick={filters.reset}>
              Clear filters
            </Button>
          ) : null}
        </div>
      )}
      {filters.total > filters.pageSize ? (
        <div className="flex items-center justify-end gap-2 border-t px-4 py-3 text-xs">
          <Button
            variant="secondary"
            disabled={filters.page === 1}
            onClick={() => filters.setPage(filters.page - 1)}
          >
            Previous
          </Button>
          <span className="tabular-nums">
            {filters.page} / {Math.ceil(filters.total / filters.pageSize)}
          </span>
          <Button
            variant="secondary"
            disabled={filters.page * filters.pageSize >= filters.total}
            onClick={() => filters.setPage(filters.page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </ManagerDashboardCard>
  )
}
export { ManagerTeamSection }
