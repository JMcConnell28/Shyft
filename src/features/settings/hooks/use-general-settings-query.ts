"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { settingsQueryKeys } from "@/features/settings/query-keys"
import { getGeneralSettingsPageData } from "@/features/settings/server-fns"

function useGeneralSettingsQuery(input: {
  organizationId: string
  userId: string
}) {
  const getGeneralSettingsPageDataFn = useServerFn(getGeneralSettingsPageData)

  return useQuery({
    queryKey: settingsQueryKeys.general(input),
    queryFn: () =>
      getGeneralSettingsPageDataFn({
        data: input,
      }),
  })
}

export { useGeneralSettingsQuery }
