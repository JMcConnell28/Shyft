"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { saveRotaWorkspace } from "@/features/rota/server-fns"
import type { RotaListPageData } from "@/features/rota/types"
import { buildSaveRotaWorkspacePayload } from "@/features/rota/utils/rota-workspace-payload"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

const SAVE_RATE_LIMIT_MS = 1500

function useSaveRotaWorkspace() {
  const queryClient = useQueryClient()
  const saveRotaWorkspaceFn = useServerFn(saveRotaWorkspace)
  const {
    assignmentsById,
    hasUnsavedChanges,
    markChangesSaved,
    meta,
    shiftsById,
  } = useRotaWorkspace()
  const [cooldownUntil, setCooldownUntil] = React.useState(0)
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (cooldownUntil <= now) {
      return
    }

    const timeout = window.setTimeout(() => {
      setNow(Date.now())
    }, cooldownUntil - now)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [cooldownUntil, now])

  const saveMutation = useMutation({
    meta: {
      disableErrorToast: true,
    },
    mutationFn: () =>
      saveRotaWorkspaceFn({
        data: buildSaveRotaWorkspacePayload({
          meta,
          shiftsById,
          assignmentsById,
        }),
      }),
    onSuccess: async () => {
      const nextCooldownUntil = Date.now() + SAVE_RATE_LIMIT_MS
      setCooldownUntil(nextCooldownUntil)
      setNow(Date.now())
      markChangesSaved()
      updateRotaListSaveState(queryClient, meta.rotaId, meta.status)

      void queryClient.invalidateQueries({
        queryKey: rotaQueryKeys.all,
      })

      showSuccessToast(
        meta.status === "published"
          ? "Changes saved. Republish to make them live."
          : "Rota saved."
      )
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not save your rota changes.",
      })
    },
  })

  const isRateLimited = cooldownUntil > now
  const canSave =
    meta.canEdit &&
    (meta.status === "draft" || meta.status === "published") &&
    hasUnsavedChanges &&
    !saveMutation.isPending &&
    !isRateLimited

  async function save(options?: { bypassRateLimit?: boolean }) {
    const canSaveNow =
      meta.canEdit &&
      (meta.status === "draft" || meta.status === "published") &&
      hasUnsavedChanges &&
      !saveMutation.isPending &&
      (!isRateLimited || options?.bypassRateLimit === true)

    if (!canSaveNow) {
      return
    }

    await saveMutation.mutateAsync()
  }

  return {
    canSave,
    isSaving: saveMutation.isPending,
    save,
    saveBlockedReason:
      !meta.canEdit
        ? "Past rotas are locked and can no longer be edited."
        : hasUnsavedChanges
        ? isRateLimited
          ? "Saving is cooling down for a moment."
          : null
        : "No changes to save yet.",
  }
}

function updateRotaListSaveState(
  queryClient: ReturnType<typeof useQueryClient>,
  rotaId: string,
  status: "draft" | "published"
) {
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
          hasUnpublishedChanges:
            status === "published" ? true : row.hasUnpublishedChanges,
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

export { useSaveRotaWorkspace }
