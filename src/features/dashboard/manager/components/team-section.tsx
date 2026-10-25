import { z } from "zod"
import {
  dashboardSelectClass,
  teamFilterLabels,
  teamFilterValues,
} from "../constants"
import { DashboardTeamRow } from "./team-row"
import type { ManagerDayData, TeamRow } from "../types"
import type { useTeamFilters } from "../hooks/use-team-filters"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const filterSchema = z.enum(teamFilterValues)
const teamFilterSelectClass = cn(
  dashboardSelectClass,
  "h-9 w-full px-2 text-[11px] sm:h-10 sm:w-auto sm:px-3 sm:text-xs"
)

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
    <section
      id="dashboard-team"
      aria-labelledby="team-heading"
      className="min-w-0 scroll-mt-4 overflow-hidden rounded-xl border border-[#e0e6f1] bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
        <h2 id="team-heading" className="text-sm font-bold">
          {data.isToday ? "Today’s team" : "Team for selected day"}
        </h2>
        <span className="text-xs text-[#7481a0]">{filters.total} records</span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 sm:flex sm:flex-wrap">
        <Input
          aria-label="Search employees"
          placeholder="Search employees…"
          className="col-span-2 h-9 min-w-0 flex-1 rounded-lg text-xs sm:h-10 sm:min-w-40"
          value={filters.search}
          onChange={(event) => filters.setSearch(event.target.value)}
        />
        <select
          aria-label="Filter by zone"
          className={cn(
            teamFilterSelectClass,
            !data.location.attendanceEnabled && "col-span-2"
          )}
          value={filters.zone}
          onChange={(event) => filters.setZone(event.target.value)}
        >
          <option value="">All zones</option>
          {filters.zones.map((zone) => (
            <option key={zone}>{zone}</option>
          ))}
        </select>
        {data.location.attendanceEnabled ? (
          <select
            aria-label="Filter by status"
            className={teamFilterSelectClass}
            value={filters.status}
            onChange={(event) => {
              const parsed = filterSchema.safeParse(event.target.value)
              if (parsed.success) filters.setStatus(parsed.data)
            }}
          >
            {teamFilterValues.map((value) => (
              <option key={value} value={value}>
                {teamFilterLabels[value]}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {filters.rows.length ? (
        filters.rows.map((row) => (
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
        ))
      ) : (
        <div className="border-t border-[#edf0f6] px-4 py-10 text-center text-xs text-[#7481a0]">
          <p>
            {data.team.length
              ? "No employees match these filters."
              : "No published staffing or attendance records for this day."}
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
    </section>
  )
}
export { ManagerTeamSection }
