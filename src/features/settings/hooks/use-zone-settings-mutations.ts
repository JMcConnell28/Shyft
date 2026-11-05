"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { applyZoneCacheChange } from "@/features/settings/utils/zone-mutation-cache"
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

  const createMutation = useMutation({
    mutationFn: (data: { locationId: string; name: string }) =>
      createZoneFn({
        data: {
          ...input,
          ...data,
        },
      }),
    onSuccess: async (zone) => {
      await applyZoneCacheChange(queryClient, input, {
        type: "created",
        locationId: zone.locationId,
        zone,
      })
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
    onSuccess: async (zone) => {
      await applyZoneCacheChange(queryClient, input, {
        type: "renamed",
        ...zone,
      })
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
    onSuccess: async (zone) => {
      await applyZoneCacheChange(queryClient, input, {
        type: "archived",
        id: zone.id,
        locationId: zone.locationId,
      })
      showSuccessToast("Zone archived.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not archive that zone.",
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
