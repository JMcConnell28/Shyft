import type { TeamStatus } from "./types"

const teamStatusLabels: Record<TeamStatus, string> = {
  scheduled: "Scheduled",
  upcoming: "Upcoming",
  working: "Working",
  finished: "Finished",
  arrival_due: "Arrival not recorded",
  clock_out_missing: "Clock-out not recorded",
  reviewed: "Arrival reviewed",
}
const teamFilterValues = [
  "all",
  "scheduled",
  "working",
  "upcoming",
  "finished",
  "arrival_due",
  "clock_out_missing",
  "reviewed",
  "late",
  "review",
] as const
type TeamFilter = (typeof teamFilterValues)[number]
const teamFilterLabels: Record<TeamFilter, string> = {
  ...teamStatusLabels,
  all: "All statuses",
  late: "Late arrivals",
  review: "Needs review",
}
const dashboardSelectClass =
  "h-11 min-w-0 rounded-lg border border-input bg-card px-3 text-base font-medium text-foreground outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring sm:text-sm md:h-9"
const dashboardTeamColumns = {
  attendance:
    "@2xl/team:grid-cols-[minmax(9rem,1.4fr)_minmax(7rem,1fr)_minmax(8rem,1.1fr)_minmax(7rem,1fr)_2.75rem]",
  published:
    "@2xl/team:grid-cols-[minmax(9rem,1.4fr)_minmax(7rem,1fr)_minmax(7rem,1fr)_2.75rem]",
}
export {
  teamStatusLabels,
  teamFilterValues,
  teamFilterLabels,
  dashboardSelectClass,
  dashboardTeamColumns,
}
export type { TeamFilter }
