import { queryOptions } from "@tanstack/react-query"
import type { ShiftOverviewInput } from "@/features/dashboard/types"
import { getDashboardShiftOverview } from "@/features/dashboard/server-fns"
import { timeClockQueryKeys } from "@/features/time-clock/query-keys"

function shiftOverviewQueryOptions(
  input: ShiftOverviewInput,
  fetcher: (options: {
    data: ShiftOverviewInput
  }) => ReturnType<typeof getDashboardShiftOverview> = getDashboardShiftOverview
) {
  return queryOptions({
    queryKey: timeClockQueryKeys.dashboard(input),
    queryFn: () => fetcher({ data: input }),
    staleTime: 15_000,
    refetchInterval: (query) =>
      query.state.data?.clockStatus.openEntry ? 30_000 : false,
  })
}

export { shiftOverviewQueryOptions }
