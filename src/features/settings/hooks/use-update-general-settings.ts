"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { settingsQueryKeys } from "@/features/settings/query-keys"
import { updateGeneralSettings } from "@/features/settings/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useUpdateGeneralSettings(input: {
  organizationId: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const updateGeneralSettingsFn = useServerFn(updateGeneralSettings)

  const mutation = useMutation({
    mutationFn: (values: { contactEmail: string; contactPhone: string }) =>
      updateGeneralSettingsFn({
        data: {
          ...input,
          ...values,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.all,
      })
      showSuccessToast("Workplace contact details saved.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not save workplace contact details.",
      })
    },
  })

  return {
    isSaving: mutation.isPending,
    saveGeneralSettings: mutation.mutateAsync,
  }
}

export { useUpdateGeneralSettings }
