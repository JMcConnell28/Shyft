import { queryOptions } from "@tanstack/react-query"

import type { TimesheetScopeInput } from "@/features/timesheets/types"
import { timesheetQueryKeys } from "@/features/timesheets/query-keys"
import { getTimesheetPageData } from "@/features/timesheets/server-fns"

function timesheetQueryOptions(
  input: TimesheetScopeInput,
  fetcher: (options: {
    data: TimesheetScopeInput
  }) => ReturnType<typeof getTimesheetPageData> = getTimesheetPageData
) {
  return queryOptions({
    queryKey: timesheetQueryKeys.page(input),
    queryFn: () => fetcher({ data: input }),
  })
}

export { timesheetQueryOptions }
