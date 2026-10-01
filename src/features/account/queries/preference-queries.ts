import { queryOptions } from "@tanstack/react-query"

import { getAccountPreferences } from "@/features/account/preference-server-fns"

const accountPreferenceKeys = {
  user: (userId: string) => ["account", "preferences", userId] as const,
}

function accountPreferencesQueryOptions(
  userId: string,
  fetcher: () => ReturnType<
    typeof getAccountPreferences
  > = getAccountPreferences
) {
  return queryOptions({
    queryKey: accountPreferenceKeys.user(userId),
    queryFn: () => fetcher(),
  })
}

export { accountPreferenceKeys, accountPreferencesQueryOptions }
