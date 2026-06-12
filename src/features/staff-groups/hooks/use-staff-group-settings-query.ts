"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { staffGroupQueryKeys } from "@/features/staff-groups/query-keys"
import { getStaffGroupSettingsPageData } from "@/features/staff-groups/server-fns"

function useStaffGroupSettingsQuery(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getStaffGroupSettingsPageDataFn = useServerFn(
    getStaffGroupSettingsPageData,
  )

  return useQuery({
    queryKey: staffGroupQueryKeys.settings(input),
    queryFn: () =>
      getStaffGroupSettingsPageDataFn({
        data: input,
      }),
  })
}

export { useStaffGroupSettingsQuery }
