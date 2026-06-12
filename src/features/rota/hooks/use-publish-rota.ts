"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { publishRotaVersion, saveRotaWorkspace } from "@/features/rota/server-fns"
import type { RotaListPageData } from "@/features/rota/types"
import type { WorkspaceBoardData } from "@/features/rota/types/workspace"
import { buildSaveRotaWorkspacePayload } from "@/features/rota/utils/rota-workspace-payload"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function usePublishRota() {
  const queryClient = useQueryClient()
  const saveRotaWorkspaceFn = useServerFn(saveRotaWorkspace)
  const publishRotaVersionFn = useServerFn(publishRotaVersion)
  const {
    assignmentsById,
    hasUnsavedChanges,
    markChangesSaved,
    markPublished,
    meta,
    shiftsById,
  } = useRotaWorkspace()

  const mutation = useMutation({
    meta: {
      disableErrorToast: true,
      disableSuccessToast: true,
    },
    mutationFn: async () => {
      if (hasUnsavedChanges) {
        await saveRotaWorkspaceFn({
          data: buildSaveRotaWorkspacePayload({
            meta,
            shiftsById,
            assignmentsById,
          }),
        })
      }

      return publishRotaVersionFn({
        data: {
          rotaId: meta.rotaId,
        },
      })
    },
    onSuccess: async (result) => {
      if (hasUnsavedChanges) {
        markChangesSaved()
      }

      markPublished()
      updateWorkspaceCaches(queryClient, meta.rotaId)
      updateListCaches(queryClient, meta.rotaId)

      await queryClient.invalidateQueries({
        queryKey: rotaQueryKeys.all,
      })

      if (result.notificationEmailCount > 0) {
        showSuccessToast(
          `Rota published. ${result.notificationEmailCount} email${
            result.notificationEmailCount === 1 ? "" : "s"
          } queued.`,
        )
      } else {
        showSuccessToast("Rota published. No staff emails were queued.")
      }

      if (result.notificationEmailError) {
        showErrorToast(new Error("Rota published, but email notifications failed."))
      }
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not publish that rota.",
      })
    },
  })

  const canPublish =
    !mutation.isPending &&
    (meta.status === "draft" || meta.hasUnpublishedChanges || hasUnsavedChanges)

  return {
    canPublish,
    isPublishing: mutation.isPending,
    publish: mutation.mutateAsync,
    publishBlockedReason: mutation.isPending
      ? "Publishing is already in progress."
      : meta.status === "published" && !meta.hasUnpublishedChanges && !hasUnsavedChanges
        ? "No unpublished changes to publish yet."
        : null,
  }
}

function updateWorkspaceCaches(queryClient: ReturnType<typeof useQueryClient>, rotaId: string) {
  queryClient.setQueriesData<WorkspaceBoardData>(
    {
      queryKey: rotaQueryKeys.all,
    },
    (currentData) => {
      if (!currentData || !isWorkspaceBoardData(currentData)) {
        return currentData
      }

      if (currentData.meta.rotaId !== rotaId) {
        return currentData
      }

      return {
        ...currentData,
        meta: {
          ...currentData.meta,
          status: "published",
          publishedVersion: currentData.meta.publishedVersion + 1,
          hasUnpublishedChanges: false,
          publishedSnapshotAvailable: true,
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
      if (!currentData || !isRotaListPageData(currentData)) {
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
          status: "published" as const,
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

function isWorkspaceBoardData(value: unknown): value is WorkspaceBoardData {
  return (
    typeof value === "object" &&
    value !== null &&
    "meta" in value &&
    typeof value.meta === "object" &&
    value.meta !== null &&
    "rotaId" in value.meta &&
    "days" in value &&
    Array.isArray(value.days)
  )
}

function isRotaListPageData(value: unknown): value is RotaListPageData {
  return (
    typeof value === "object" &&
    value !== null &&
    "rows" in value &&
    Array.isArray(value.rows) &&
    "overview" in value
  )
}

export { usePublishRota }
