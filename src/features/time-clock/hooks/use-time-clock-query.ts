"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { timeClockQueryKeys } from "@/features/time-clock/query-keys"
import {
  getAdminClockTagsPageData,
  getClockSettingsPageData,
  getEmployeeClockPageData,
  getManagerClockPageData,
} from "@/features/time-clock/server-fns"

function useEmployeeClockQuery(input: { scanSessionId: string; userId: string }) {
  const getEmployeeClockPageDataFn = useServerFn(getEmployeeClockPageData)

  return useQuery({
    queryKey: timeClockQueryKeys.employee(input),
    queryFn: () => getEmployeeClockPageDataFn({ data: input }),
  })
}

function useAdminClockTagsQuery(input: { userId: string }) {
  const getAdminClockTagsPageDataFn = useServerFn(getAdminClockTagsPageData)

  return useQuery({
    queryKey: timeClockQueryKeys.adminTags(input),
    queryFn: () => getAdminClockTagsPageDataFn({ data: input }),
  })
}

function useManagerClockQuery(input: {
  date?: string
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getManagerClockPageDataFn = useServerFn(getManagerClockPageData)

  return useQuery({
    queryKey: timeClockQueryKeys.manager(input),
    queryFn: () => getManagerClockPageDataFn({ data: input }),
    refetchInterval: 30000,
  })
}

function useClockSettingsQuery(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getClockSettingsPageDataFn = useServerFn(getClockSettingsPageData)

  return useQuery({
    queryKey: timeClockQueryKeys.settings(input),
    queryFn: () => getClockSettingsPageDataFn({ data: input }),
  })
}

export {
  useAdminClockTagsQuery,
  useClockSettingsQuery,
  useEmployeeClockQuery,
  useManagerClockQuery,
}
