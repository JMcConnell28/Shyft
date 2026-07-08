"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { updateRotaBudget } from "@/features/rota/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useUpdateRotaBudget() {
  const queryClient = useQueryClient()
  const updateRotaBudgetFn = useServerFn(updateRotaBudget)
  const { meta, setBudgetPence } = useRotaWorkspace()

  const mutation = useMutation({
    mutationFn: (budgetPence: number | null) =>
      updateRotaBudgetFn({
        data: { rotaId: meta.rotaId, budgetPence },
      }),
    onSuccess: async (_, budgetPence) => {
      setBudgetPence(budgetPence)
      await queryClient.invalidateQueries({ queryKey: rotaQueryKeys.all })
      showSuccessToast(
        budgetPence === null ? "Budget removed." : "Budget saved."
      )
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not save that weekly budget.",
      })
    },
  })

  return {
    isSaving: mutation.isPending,
    saveBudget: mutation.mutateAsync,
  }
}

export { useUpdateRotaBudget }
