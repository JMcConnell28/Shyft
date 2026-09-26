"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { RotaSettingsPageData } from "@/features/settings/types"
import { useRefreshNavigation } from "@/features/navigation/hooks/use-refresh-navigation"
import { settingsQueryKeys } from "@/features/settings/query-keys"
import { updateShiftSwapSetting } from "@/features/settings/server-fns"
import { showErrorToast } from "@/lib/toast"

function useUpdateShiftSwapSetting(input: {
  organizationId: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const refreshNavigation = useRefreshNavigation()
  const updateSetting = useServerFn(updateShiftSwapSetting)
  const queryKey = settingsQueryKeys.rota(input)

  return useMutation({
    mutationFn: (enabled: boolean) =>
      updateSetting({ data: { ...input, enabled } }),
    onSuccess: async (enabled) => {
      queryClient.setQueryData<RotaSettingsPageData>(queryKey, (current) =>
        current ? { ...current, shiftSwapsEnabled: enabled } : current
      )
      await queryClient.invalidateQueries({ queryKey, refetchType: "none" })
      await refreshNavigation()
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update shift swapping.",
      })
    },
  })
}

export { useUpdateShiftSwapSetting }
