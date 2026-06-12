"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { settingsQueryKeys } from "@/features/settings/query-keys"
import { getRotaSettingsPageData } from "@/features/settings/server-fns"

function useRotaSettingsQuery(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getRotaSettingsPageDataFn = useServerFn(getRotaSettingsPageData)

  return useQuery({
    queryKey: settingsQueryKeys.rota(input),
    queryFn: () =>
      getRotaSettingsPageDataFn({
        data: input,
      }),
  })
}

export { useRotaSettingsQuery }
