import { queryOptions } from "@tanstack/react-query"

import { staffGroupQueryKeys } from "@/features/staff-groups/query-keys"
import { getStaffGroupSettingsPageData } from "@/features/staff-groups/server-fns"

type StaffGroupSettingsInput = {
  organizationId?: string
  locationId?: string
  userId: string
}

function staffGroupSettingsQueryOptions(
  input: StaffGroupSettingsInput,
  fetcher: (options: {
    data: StaffGroupSettingsInput
  }) => ReturnType<
    typeof getStaffGroupSettingsPageData
  > = getStaffGroupSettingsPageData
) {
  return queryOptions({
    queryKey: staffGroupQueryKeys.settings(input),
    queryFn: () => fetcher({ data: input }),
    staleTime: 2 * 60_000,
  })
}

export { staffGroupSettingsQueryOptions }
export type { StaffGroupSettingsInput }
