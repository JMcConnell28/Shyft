"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { RotaSettingsValues } from "@/features/settings/types"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { settingsQueryKeys } from "@/features/settings/query-keys"
import { updateRotaSettings } from "@/features/settings/server-fns"
import { showErrorToast } from "@/lib/toast"

function useRotaSettingsMutations(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const updateRotaSettingsFn = useServerFn(updateRotaSettings)

  const updateSettingsMutation = useMutation({
    mutationFn: (
      variables: RotaSettingsValues & {
        locationId: string
      }
    ) =>
      updateRotaSettingsFn({
        data: {
          ...input,
          ...variables,
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: settingsQueryKeys.rota(input),
        }),
        queryClient.invalidateQueries({ queryKey: rotaQueryKeys.all }),
      ])
    },
    onError: async (error) => {
      await queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.rota(input),
      })
      showErrorToast(error, {
        fallbackMessage: "We could not save the rota settings.",
      })
    },
  })

  return { updateSettingsMutation }
}

export { useRotaSettingsMutations }
