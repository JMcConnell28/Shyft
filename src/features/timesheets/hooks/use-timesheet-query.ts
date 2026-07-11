"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { TimesheetScopeInput } from "@/features/timesheets/types"
import { timesheetQueryOptions } from "@/features/timesheets/query-options"
import { getTimesheetPageData } from "@/features/timesheets/server-fns"

function useTimesheetQuery(input: TimesheetScopeInput) {
  const getTimesheetPageDataFn = useServerFn(getTimesheetPageData)

  return useQuery(timesheetQueryOptions(input, getTimesheetPageDataFn))
}

export { useTimesheetQuery }
