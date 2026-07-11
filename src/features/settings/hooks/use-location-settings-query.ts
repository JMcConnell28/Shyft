"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { locationSettingsQueryOptions } from "@/features/settings/query-options"
import { getLocationSettingsPageData } from "@/features/settings/server-fns"

function useLocationSettingsQuery(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getLocationSettingsPageDataFn = useServerFn(getLocationSettingsPageData)

  return useQuery(
    locationSettingsQueryOptions(input, getLocationSettingsPageDataFn)
  )
}

export { useLocationSettingsQuery }
