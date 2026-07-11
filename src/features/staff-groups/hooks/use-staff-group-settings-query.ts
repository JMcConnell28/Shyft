"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { staffGroupSettingsQueryOptions } from "@/features/staff-groups/query-options"
import { getStaffGroupSettingsPageData } from "@/features/staff-groups/server-fns"

function useStaffGroupSettingsQuery(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getStaffGroupSettingsPageDataFn = useServerFn(
    getStaffGroupSettingsPageData
  )

  return useQuery(
    staffGroupSettingsQueryOptions(input, getStaffGroupSettingsPageDataFn)
  )
}

export { useStaffGroupSettingsQuery }
