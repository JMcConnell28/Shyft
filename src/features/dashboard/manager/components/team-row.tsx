import { Link } from "@tanstack/react-router"
import { MoreHorizontalIcon } from "lucide-react"
import { teamStatusLabels } from "../constants"
import { formatDashboardTime } from "../utils/date"
import type { DashboardLocation, TeamRow } from "../types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmployeeIdentity } from "@/features/time-clock/components/employee-identity"
import { getDateKeyInTimeZone } from "@/lib/time-zone"
import { cn } from "@/lib/utils"

function DashboardTeamRow({
  row,
  location,
  isToday,
  workspaceSlug,
  canManageRota,
  isClockedIn,
  onClock,
  onReview,
}: {
  row: TeamRow
  location: DashboardLocation
  isToday: boolean
  workspaceSlug: string
  canManageRota: boolean
  isClockedIn: boolean
  onClock: (row: TeamRow, action: "clock_in" | "clock_out") => void
  onReview: (row: TeamRow) => void
}) {
  const time = (value: string) =>
    formatDashboardTime(value, location.timeZone, location.timeFormat)
  const overnight =
    row.startsAt &&
    row.endsAt &&
    getDateKeyInTimeZone(row.startsAt, location.timeZone) !==
      getDateKeyInTimeZone(row.endsAt, location.timeZone)
  const canClock =
    isToday && row.isActive && location.attendanceEnabled && location.canWrite
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-[#edf0f6] px-4 py-3 lg:grid-cols-[minmax(7rem,1fr)_minmax(7rem,1fr)_minmax(6rem,1fr)_minmax(6rem,1fr)_2rem]">
      <EmployeeIdentity
        name={row.employeeName}
        secondary={row.zone}
        size="compact"
      />
      <div className="col-start-1 row-start-2 text-xs lg:col-auto lg:row-auto">
        <p className="font-semibold text-[#46577d]">
          {row.startsAt && row.endsAt
            ? `${time(row.startsAt)} – ${time(row.endsAt)}`
            : "Unscheduled"}
          {overnight ? " (+1 day)" : ""}
        </p>
        <p className="mt-1 text-[10px] text-[#7481a0]">
          {row.segment === "split_first"
            ? "Split · first half"
            : row.segment === "split_second"
              ? "Split · second half"
              : row.closesAtEstimate
                ? "To close · estimated finish"
                : "Scheduled shift"}
        </p>
      </div>
      {location.attendanceEnabled ? (
        <div className="col-start-1 text-xs lg:col-auto">
          <p className="text-[#46577d]">
            {row.clockedInAt
              ? `In ${time(row.clockedInAt)}`
              : "No clock-in recorded"}
            {row.clockedOutAt ? ` · Out ${time(row.clockedOutAt)}` : ""}
          </p>
          {row.lateMinutes > 0 ? (
            <p className="mt-1 text-[10px] font-semibold text-orange-700">
              Arrived {row.lateMinutes} min late
            </p>
          ) : null}
        </div>
      ) : (
        <span className="hidden lg:block" />
      )}
      <div className="col-start-2 row-start-1 text-right lg:col-auto lg:row-auto lg:text-left">
        <span
          className={cn(
            "inline-block rounded-md px-2 py-1 text-[10px] font-semibold",
            row.status === "working"
              ? "bg-blue-50 text-blue-700"
              : row.status === "arrival_due" ||
                  row.status === "clock_out_missing"
                ? "bg-orange-50 text-orange-800"
                : "bg-[#f0f3f8] text-[#68769a]"
          )}
        >
          {teamStatusLabels[row.status]}
        </span>
        {row.requiresReview ? (
          <p className="mt-1 text-[10px] text-orange-700">Needs review</p>
        ) : null}
      </div>
      <div className="col-start-2 row-start-2 justify-self-end lg:col-auto lg:row-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
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
                onClick={() =>
                  onClock(row, isClockedIn ? "clock_out" : "clock_in")
                }
              >
                Manual {isClockedIn ? "clock out" : "clock in"}
              </DropdownMenuItem>
            ) : null}
            {!row.rotaId && !location.attendanceEnabled ? (
              <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
export { DashboardTeamRow }
