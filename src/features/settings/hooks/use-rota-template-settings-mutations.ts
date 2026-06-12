"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { settingsQueryKeys } from "@/features/settings/query-keys"
import {
  deleteRotaTemplate,
  renameRotaTemplate,
} from "@/features/settings/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useRotaTemplateSettingsMutations(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const renameRotaTemplateFn = useServerFn(renameRotaTemplate)
  const deleteRotaTemplateFn = useServerFn(deleteRotaTemplate)

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

  const renameMutation = useMutation({
    mutationFn: (data: { templateId: string; name: string }) =>
      renameRotaTemplateFn({
        data: {
          ...input,
          ...data,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Template renamed.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not rename that template.",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (templateId: string) =>
      deleteRotaTemplateFn({
        data: {
          ...input,
          templateId,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Template deleted.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not delete that template.",
      })
    },
  })

  return {
    deleteMutation,
    renameMutation,
  }
}

export { useRotaTemplateSettingsMutations }
