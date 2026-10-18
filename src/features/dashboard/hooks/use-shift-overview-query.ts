import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import type {
  DashboardShiftOverview,
  ShiftOverviewInput,
} from "@/features/dashboard/types"
import { shiftOverviewQueryOptions } from "@/features/dashboard/shift-overview-query-options"
import { getDashboardShiftOverview } from "@/features/dashboard/server-fns"

function useShiftOverviewQuery(
  input: ShiftOverviewInput,
  initialData: DashboardShiftOverview
) {
  const fetcher = useServerFn(getDashboardShiftOverview)
  return useQuery({ ...shiftOverviewQueryOptions(input, fetcher), initialData })
}

export { useShiftOverviewQuery }
