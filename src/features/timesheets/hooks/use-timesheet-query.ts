"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { timesheetQueryKeys } from "@/features/timesheets/query-keys"
import { getTimesheetPageData } from "@/features/timesheets/server-fns"
import type { TimesheetScopeInput } from "@/features/timesheets/types"

function useTimesheetQuery(input: TimesheetScopeInput) {
  const getTimesheetPageDataFn = useServerFn(getTimesheetPageData)

  return useQuery({
    queryKey: timesheetQueryKeys.page(input),
    queryFn: () => getTimesheetPageDataFn({ data: input }),
  })
}

export { useTimesheetQuery }
