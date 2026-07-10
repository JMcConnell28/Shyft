"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { settingsQueryKeys } from "@/features/settings/query-keys"
import { getLocationSettingsPageData } from "@/features/settings/server-fns"

function useLocationSettingsQuery(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getLocationSettingsPageDataFn = useServerFn(getLocationSettingsPageData)

  return useQuery({
    queryKey: settingsQueryKeys.locations(input),
    queryFn: () =>
      getLocationSettingsPageDataFn({
        data: input,
      }),
  })
}

export { useLocationSettingsQuery }
