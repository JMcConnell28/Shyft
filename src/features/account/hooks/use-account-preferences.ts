import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { AccountPreferences } from "@/features/account/types"
import {
  getAccountPreferences,
  updateAccountPreferences,
} from "@/features/account/preference-server-fns"
import {
  accountPreferenceKeys,
  accountPreferencesQueryOptions,
} from "@/features/account/queries/preference-queries"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useAccountPreferences(userId: string) {
  const queryClient = useQueryClient()
  const readPreferences = useServerFn(getAccountPreferences)
  const savePreferences = useServerFn(updateAccountPreferences)
  const query = useQuery(
    accountPreferencesQueryOptions(userId, readPreferences)
  )
  const mutation = useMutation({
    mutationFn: (data: AccountPreferences) => savePreferences({ data }),
    onSuccess: (preferences) => {
      queryClient.setQueryData(accountPreferenceKeys.user(userId), preferences)
      showSuccessToast("Preferences saved.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not save your preferences.",
      })
    },
  })

  return { query, mutation }
}

export { useAccountPreferences }
