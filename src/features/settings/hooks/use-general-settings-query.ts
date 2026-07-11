"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { generalSettingsQueryOptions } from "@/features/settings/query-options"
import { getGeneralSettingsPageData } from "@/features/settings/server-fns"

function useGeneralSettingsQuery(input: {
  organizationId: string
  userId: string
}) {
  const getGeneralSettingsPageDataFn = useServerFn(getGeneralSettingsPageData)

  return useQuery(
    generalSettingsQueryOptions(input, getGeneralSettingsPageDataFn)
  )
}

export { useGeneralSettingsQuery }
