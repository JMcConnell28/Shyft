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
  "h-10 min-w-0 rounded-lg border border-[#dfe4ef] bg-white px-3 text-xs font-semibold text-[#10204b] outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
export {
  teamStatusLabels,
  teamFilterValues,
  teamFilterLabels,
  dashboardSelectClass,
}
export type { TeamFilter }
