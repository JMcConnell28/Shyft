import { dashboardTeamColumns, teamStatusLabels } from "../constants"
import { formatDashboardTime } from "../utils/date"
import { DashboardTeamRowActions } from "./team-row-actions"
import type { DashboardTeamRowProps } from "../types"
import { EmployeeIdentity } from "@/features/time-clock/components/employee-identity"
import { getDateKeyInTimeZone } from "@/lib/time-zone"
import { cn } from "@/lib/utils"

function DashboardTeamRow(props: DashboardTeamRowProps) {
  const { row, location } = props
  const time = (value: string) =>
    formatDashboardTime(value, location.timeZone, location.timeFormat)
  const overnight =
    row.startsAt &&
    row.endsAt &&
    getDateKeyInTimeZone(row.startsAt, location.timeZone) !==
      getDateKeyInTimeZone(row.endsAt, location.timeZone)
  return (
    <div
      role="row"
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto_2.75rem] items-center gap-x-2 gap-y-1 border-t border-border/70 px-4 py-4 transition-colors hover:bg-muted/25 sm:px-5 @2xl/team:min-h-18 @2xl/team:gap-3 @2xl/team:py-3",
        location.attendanceEnabled
          ? dashboardTeamColumns.attendance
          : dashboardTeamColumns.published
      )}
    >
      <div role="cell" className="col-span-2 min-w-0 @2xl/team:col-span-1">
        <EmployeeIdentity
          name={row.employeeName}
          secondary={row.zone}
          size="compact"
        />
      </div>
      <div
        role="cell"
        className="col-start-1 row-start-2 text-sm @2xl/team:col-auto @2xl/team:row-auto"
      >
        <p className="text-xs font-medium text-foreground tabular-nums sm:text-sm">
          {row.startsAt && row.endsAt
            ? `${time(row.startsAt)} – ${time(row.endsAt)}`
            : "Unscheduled"}
          {overnight ? " (+1 day)" : ""}
        </p>
        {row.segment === "split_first" ||
        row.segment === "split_second" ||
        row.closesAtEstimate ? (
          <p className="text-xs text-muted-foreground">
            {row.segment === "split_first"
              ? "Split · first half"
              : row.segment === "split_second"
                ? "Split · second half"
                : row.closesAtEstimate
                  ? "To close · estimated finish"
                  : null}
          </p>
        ) : null}
      </div>
      {location.attendanceEnabled ? (
        <div
          role="cell"
          className="col-start-1 row-start-3 text-xs @2xl/team:col-auto @2xl/team:row-auto"
        >
          <p className="text-muted-foreground tabular-nums">
            {row.clockedInAt ? (
              `In ${time(row.clockedInAt)}`
            ) : (
              <span className="hidden @2xl/team:inline">
                <span aria-hidden="true">—</span>
                <span className="sr-only">No clock-in recorded</span>
              </span>
            )}
            {row.clockedOutAt ? ` · Out ${time(row.clockedOutAt)}` : ""}
          </p>
          {row.lateMinutes > 0 ? (
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              {row.lateMinutes} min late
            </p>
          ) : null}
        </div>
      ) : null}
      <div
        role="cell"
        className="col-start-2 row-span-2 row-start-2 max-w-28 text-right @2xl/team:col-auto @2xl/team:row-auto @2xl/team:text-left"
      >
        <span
          className={cn(
            "inline-flex rounded-md px-2 py-1 text-xs font-medium",
            row.status === "working"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : row.status === "arrival_due" ||
                  row.status === "clock_out_missing"
                ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                : "bg-muted/60 text-muted-foreground"
          )}
        >
          {teamStatusLabels[row.status]}
        </span>
        {row.requiresReview ? (
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Needs review
          </p>
        ) : null}
      </div>
      <div
        role="cell"
        className="col-start-3 row-span-3 row-start-1 justify-self-end @2xl/team:col-auto @2xl/team:row-auto"
      >
        <DashboardTeamRowActions {...props} />
      </div>
    </div>
  )
}
export { DashboardTeamRow }
