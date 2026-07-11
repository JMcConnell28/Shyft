"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaSettingsQueryOptions } from "@/features/settings/query-options"
import { getRotaSettingsPageData } from "@/features/settings/server-fns"

function useRotaSettingsQuery(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getRotaSettingsPageDataFn = useServerFn(getRotaSettingsPageData)

  return useQuery(rotaSettingsQueryOptions(input, getRotaSettingsPageDataFn))
}

export { useRotaSettingsQuery }
