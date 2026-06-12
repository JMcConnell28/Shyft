import type { TimesheetScopeInput } from "@/features/timesheets/types"

const timesheetQueryKeys = {
  all: ["timesheets"] as const,
  page: (input: TimesheetScopeInput) =>
    [...timesheetQueryKeys.all, "page", input] as const,
}

export { timesheetQueryKeys }
