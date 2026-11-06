import { SearchIcon } from "lucide-react"
import { teamFilterLabels, teamFilterValues } from "../constants"
import { teamFilterSchema } from "../schemas"
import { DashboardSelect } from "./dashboard-select"
import type { useTeamFilters } from "../hooks/use-team-filters"
import { Input } from "@/components/ui/input"

function ManagerTeamFilters({
  filters,
  attendanceEnabled,
}: {
  filters: ReturnType<typeof useTeamFilters>
  attendanceEnabled: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-2 border-t border-border/70 bg-muted/15 px-4 py-3 sm:px-5 @2xl/team:flex @2xl/team:flex-wrap">
      <div className="relative col-span-2 min-w-0 @2xl/team:min-w-40 @2xl/team:flex-1">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Search employees"
          placeholder="Search employees…"
          className="h-11 min-w-0 rounded-lg bg-card pl-9 text-base shadow-none md:h-9 md:text-sm"
          value={filters.search}
          onChange={(event) => filters.setSearch(event.target.value)}
        />
      </div>
      <DashboardSelect
        label="Filter by zone"
        containerClassName={!attendanceEnabled ? "col-span-2" : undefined}
        value={filters.zone}
        onChange={(event) => filters.setZone(event.target.value)}
      >
        <option value="">All zones</option>
        {filters.zones.map((zone) => (
          <option key={zone}>{zone}</option>
        ))}
      </DashboardSelect>
      {attendanceEnabled ? (
        <DashboardSelect
          label="Filter by status"
          value={filters.status}
          onChange={(event) => {
            const parsed = teamFilterSchema.safeParse(event.target.value)
            if (parsed.success) filters.setStatus(parsed.data)
          }}
        >
          {teamFilterValues.map((value) => (
            <option key={value} value={value}>
              {teamFilterLabels[value]}
            </option>
          ))}
        </DashboardSelect>
      ) : null}
    </div>
  )
}
export { ManagerTeamFilters }
