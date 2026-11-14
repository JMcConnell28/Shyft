import { Link } from "@tanstack/react-router"
import {
  CalendarDaysIcon,
  Clock3Icon,
  FileTextIcon,
  LogInIcon,
  LogOutIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import {
  getDashboardTimesheetSearch,
  getTeamClockActions,
  getTeamTimeEntry,
} from "../utils/team-attendance"
import type { DashboardTeamRowProps } from "../types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function DashboardTeamRowActions(props: DashboardTeamRowProps) {
  const {
    row,
    location,
    workspaceSlug,
    canManageRota,
    canManageTimesheets,
    onClock,
    onReview,
  } = props
  const clockActions = getTeamClockActions(props)
  const timeEntry = location.attendanceEnabled
    ? getTeamTimeEntry(row, location)
    : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="secondary"
            size="icon"
            aria-label={`Actions for ${row.employeeName}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 max-w-(--available-width) max-md:[&_[data-slot=dropdown-menu-item]]:min-h-11 max-md:[&_[data-slot=dropdown-menu-item]]:text-sm"
      >
        {clockActions ? (
          <>
            <DropdownMenuItem
              disabled={!clockActions.canClockIn}
              onClick={() =>
                onClock(clockActions.employee, "clock_in", row.segment)
              }
            >
              <LogInIcon aria-hidden="true" />
              Clock in
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!clockActions.canClockOut}
              onClick={() =>
                onClock(clockActions.employee, "clock_out", row.segment)
              }
            >
              <LogOutIcon aria-hidden="true" />
              Clock out
            </DropdownMenuItem>
            {timeEntry || row.rotaId ? <DropdownMenuSeparator /> : null}
          </>
        ) : null}
        {timeEntry ? (
          <DropdownMenuItem onClick={() => onReview(row)}>
            <Clock3Icon aria-hidden="true" />
            Review time entry
          </DropdownMenuItem>
        ) : null}
        {timeEntry && canManageTimesheets && location.canWrite ? (
          <DropdownMenuItem
            render={
              <Link
                to="/app/$workspaceSlug/timesheets"
                params={{ workspaceSlug }}
                search={getDashboardTimesheetSearch(timeEntry)}
              />
            }
          >
            <FileTextIcon aria-hidden="true" />
            View in timesheets
          </DropdownMenuItem>
        ) : null}
        {row.rotaId ? (
          <DropdownMenuItem
            render={
              <Link
                to={
                  canManageRota
                    ? "/app/$workspaceSlug/rota/$locationSlug/$rotaId"
                    : "/app/$workspaceSlug/rota/$locationSlug/$rotaId/view"
                }
                params={{
                  workspaceSlug,
                  locationSlug: location.slug,
                  rotaId: row.rotaId,
                }}
              />
            }
          >
            <CalendarDaysIcon aria-hidden="true" />
            Open rota
          </DropdownMenuItem>
        ) : null}
        {!row.rotaId && !timeEntry && !clockActions ? (
          <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export { DashboardTeamRowActions }
