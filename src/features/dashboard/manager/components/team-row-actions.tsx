import { Link } from "@tanstack/react-router"
import { MoreHorizontalIcon } from "lucide-react"
import type { DashboardTeamRowProps } from "../types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function DashboardTeamRowActions({
  row,
  location,
  isToday,
  workspaceSlug,
  canManageRota,
  isClockedIn,
  onClock,
  onReview,
}: DashboardTeamRowProps) {
  const canClock =
    isToday && row.isActive && location.attendanceEnabled && location.canWrite
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-lg sm:size-9"
            aria-label={`Actions for ${row.employeeName}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
            Open rota
          </DropdownMenuItem>
        ) : null}
        {location.attendanceEnabled && row.entryId ? (
          <DropdownMenuItem onClick={() => onReview(row)}>
            Review time entry
          </DropdownMenuItem>
        ) : null}
        {canClock && (row.status !== "finished" || isClockedIn) ? (
          <DropdownMenuItem
            onClick={() => onClock(row, isClockedIn ? "clock_out" : "clock_in")}
          >
            Manual {isClockedIn ? "clock out" : "clock in"}
          </DropdownMenuItem>
        ) : null}
        {!row.rotaId && !location.attendanceEnabled ? (
          <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export { DashboardTeamRowActions }
