"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { settingsQueryKeys } from "@/features/settings/query-keys"
import { updateLocationSettings } from "@/features/settings/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useUpdateLocationSettings(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const updateLocationSettingsFn = useServerFn(updateLocationSettings)

  const mutation = useMutation({
    mutationFn: (data: {
      daySettings: Array<{
        closeTime: string
        closeTimeNextDay: boolean
        weekday: number
      }>
      estimatedClosingTime: string
      estimatedClosingTimeNextDay: boolean
      locationId: string
    }) =>
      updateLocationSettingsFn({
        data: {
          ...input,
          ...data,
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: settingsQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: rotaQueryKeys.all,
        }),
      ])
      showSuccessToast("Location settings saved.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not save that location setting.",
      })
    },
  })

  return {
    isSaving: mutation.isPending,
    saveLocationSettings: mutation.mutateAsync,
  }
}

export { useUpdateLocationSettings }
