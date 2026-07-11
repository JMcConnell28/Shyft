import { queryOptions } from "@tanstack/react-query"

import { settingsQueryKeys } from "@/features/settings/query-keys"
import {
  getGeneralSettingsPageData,
  getLocationSettingsPageData,
  getRotaSettingsPageData,
} from "@/features/settings/server-fns"

type WorkspaceSettingsInput = {
  organizationId?: string
  locationId?: string
  userId: string
}
type GeneralSettingsInput = { organizationId: string; userId: string }

function generalSettingsQueryOptions(
  input: GeneralSettingsInput,
  fetcher: (options: {
    data: GeneralSettingsInput
  }) => ReturnType<
    typeof getGeneralSettingsPageData
  > = getGeneralSettingsPageData
) {
  return queryOptions({
    queryKey: settingsQueryKeys.general(input),
    queryFn: () => fetcher({ data: input }),
    staleTime: 5 * 60_000,
  })
}

function locationSettingsQueryOptions(
  input: WorkspaceSettingsInput,
  fetcher: (options: {
    data: WorkspaceSettingsInput
  }) => ReturnType<
    typeof getLocationSettingsPageData
  > = getLocationSettingsPageData
) {
  return queryOptions({
    queryKey: settingsQueryKeys.locations(input),
    queryFn: () => fetcher({ data: input }),
    staleTime: 5 * 60_000,
  })
}

function rotaSettingsQueryOptions(
  input: WorkspaceSettingsInput,
  fetcher: (options: {
    data: WorkspaceSettingsInput
  }) => ReturnType<typeof getRotaSettingsPageData> = getRotaSettingsPageData
) {
  return queryOptions({
    queryKey: settingsQueryKeys.rota(input),
    queryFn: () => fetcher({ data: input }),
    staleTime: 5 * 60_000,
  })
}

export {
  generalSettingsQueryOptions,
  locationSettingsQueryOptions,
  rotaSettingsQueryOptions,
}
export type { WorkspaceSettingsInput }
