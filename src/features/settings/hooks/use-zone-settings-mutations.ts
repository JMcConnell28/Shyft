"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { settingsQueryKeys } from "@/features/settings/query-keys"
import {
  createZone,
  deleteZone,
  updateZone,
} from "@/features/settings/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useZoneSettingsMutations(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const createZoneFn = useServerFn(createZone)
  const updateZoneFn = useServerFn(updateZone)
  const deleteZoneFn = useServerFn(deleteZone)

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.all,
      }),
      queryClient.invalidateQueries({
        queryKey: rotaQueryKeys.all,
      }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: (data: { locationId: string; name: string }) =>
      createZoneFn({
        data: {
          ...input,
          ...data,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Zone created.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not create that zone.",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { zoneId: string; name: string }) =>
      updateZoneFn({
        data: {
          ...input,
          ...data,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Zone updated.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that zone.",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (zoneId: string) =>
      deleteZoneFn({
        data: {
          ...input,
          zoneId,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Zone deleted.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not delete that zone.",
      })
    },
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  }
}

export { useZoneSettingsMutations }
