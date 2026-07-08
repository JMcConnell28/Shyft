"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { dashboardQueryKeys } from "@/features/dashboard/query-keys"
import { getDashboard } from "@/features/dashboard/server-fns"

function useDashboardQuery() {
  const getDashboardFn = useServerFn(getDashboard)

  return useQuery({
    queryKey: dashboardQueryKeys.all,
    queryFn: () => getDashboardFn(),
  })
}

export { useDashboardQuery }
