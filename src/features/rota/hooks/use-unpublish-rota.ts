"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { unpublishRota } from "@/features/rota/server-fns"
import type { RotaListPageData } from "@/features/rota/types"
import type { WorkspaceBoardData } from "@/features/rota/types/workspace"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useUnpublishRota() {
  const queryClient = useQueryClient()
  const unpublishRotaFn = useServerFn(unpublishRota)

  return useMutation({
    meta: {
      disableErrorToast: true,
      disableSuccessToast: true,
    },
    mutationFn: (input: { rotaId: string }) =>
      unpublishRotaFn({
        data: input,
      }),
    onSuccess: async (_, variables) => {
      updateWorkspaceCaches(queryClient, variables.rotaId)
      updateListCaches(queryClient, variables.rotaId)

      await queryClient.invalidateQueries({
        queryKey: rotaQueryKeys.all,
      })

      showSuccessToast("Rota unpublished.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not unpublish that rota.",
      })
    },
  })
}

function updateWorkspaceCaches(queryClient: ReturnType<typeof useQueryClient>, rotaId: string) {
  queryClient.setQueriesData<WorkspaceBoardData>(
    {
      queryKey: rotaQueryKeys.all,
    },
    (currentData) => {
      if (
        !currentData ||
        typeof currentData !== "object" ||
        !("meta" in currentData) ||
        typeof currentData.meta !== "object" ||
        currentData.meta === null ||
        !("rotaId" in currentData.meta) ||
        currentData.meta.rotaId !== rotaId
      ) {
        return currentData
      }

      return {
        ...currentData,
        meta: {
          ...currentData.meta,
          status: "draft",
          hasUnpublishedChanges: false,
          publishedSnapshotAvailable: false,
        },
      }
    }
  )
}

function updateListCaches(queryClient: ReturnType<typeof useQueryClient>, rotaId: string) {
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

      let didChange = false
      const nextRows = currentData.rows.map((row) => {
        if (row.id !== rotaId) {
          return row
        }

        didChange = true

        return {
          ...row,
          status: "draft" as const,
          publishedBy: null,
          isUnread: false,
          hasUnpublishedChanges: false,
        }
      })

      if (!didChange) {
        return currentData
      }

      return {
        ...currentData,
        rows: nextRows,
      }
    }
  )
}

export { useUnpublishRota }
