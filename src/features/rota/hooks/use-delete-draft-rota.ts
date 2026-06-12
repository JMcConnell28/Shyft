"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { deleteDraftRota } from "@/features/rota/server-fns"
import type { RotaListPageData } from "@/features/rota/types"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useDeleteDraftRota() {
  const queryClient = useQueryClient()
  const deleteDraftRotaFn = useServerFn(deleteDraftRota)

  return useMutation({
    meta: {
      disableErrorToast: true,
      disableSuccessToast: true,
    },
    mutationFn: (input: { rotaId: string }) =>
      deleteDraftRotaFn({
        data: input,
      }),
    onSuccess: async (_, variables) => {
      removeFromListCaches(queryClient, variables.rotaId)

      await queryClient.invalidateQueries({
        queryKey: rotaQueryKeys.all,
      })

      showSuccessToast("Draft rota deleted.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not delete that draft rota.",
      })
    },
  })
}

function removeFromListCaches(queryClient: ReturnType<typeof useQueryClient>, rotaId: string) {
  queryClient.setQueriesData<RotaListPageData>(
    {
      queryKey: rotaQueryKeys.all,
    },
    (currentData) => {
      if (
        !currentData ||
        typeof currentData !== "object" ||
        !("rows" in currentData) ||
        !Array.isArray(currentData.rows)
      ) {
        return currentData
      }

      const nextRows = currentData.rows.filter((row) => row.id !== rotaId)

      if (nextRows.length === currentData.rows.length) {
        return currentData
      }

      return {
        ...currentData,
        rows: nextRows,
      }
    }
  )
}

export { useDeleteDraftRota }
