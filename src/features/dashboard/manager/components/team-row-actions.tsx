import { Link } from "@tanstack/react-router"
import {
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
    canManageTimesheets,
    onClock,
    onReview,
  } = props
  const clockActions = getTeamClockActions(props)
  const timeEntry = location.attendanceEnabled
    ? getTeamTimeEntry(row, location)
    : null
  const showClockActions =
    clockActions && (clockActions.canClockIn || clockActions.canClockOut)

  if (!showClockActions && !timeEntry) return null

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
        {showClockActions ? (
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
            {timeEntry ? <DropdownMenuSeparator /> : null}
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export { DashboardTeamRowActions }
