"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { EmployeeClockPageData } from "@/features/time-clock/types"
import { managerClockQueryOptions } from "@/features/time-clock/manager-query-options"
import { employeeClockQueryOptions } from "@/features/time-clock/employee-query-options"
import { timeClockQueryKeys } from "@/features/time-clock/query-keys"
import {
  getClockSettingsPageData,
  getEmployeeClockPageData,
  getManagerClockPageData,
} from "@/features/time-clock/server-fns"

function useEmployeeClockQuery(
  input: {
    scanSessionId: string
    userId: string
  },
  initialData: EmployeeClockPageData
) {
  const getEmployeeClockPageDataFn = useServerFn(getEmployeeClockPageData)

  return useQuery(
    employeeClockQueryOptions(input, initialData, getEmployeeClockPageDataFn)
  )
}

function useManagerClockQuery(input: {
  date?: string
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getManagerClockPageDataFn = useServerFn(getManagerClockPageData)

  return useQuery(managerClockQueryOptions(input, getManagerClockPageDataFn))
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
  useClockSettingsQuery,
  useEmployeeClockQuery,
  useManagerClockQuery,
}
