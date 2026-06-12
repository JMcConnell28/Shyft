"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { updateRotaNote } from "@/features/rota/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useUpdateRotaNote() {
  const queryClient = useQueryClient()
  const updateRotaNoteFn = useServerFn(updateRotaNote)
  const { meta, setMetaNote } = useRotaWorkspace()

  const mutation = useMutation({
    mutationFn: (note: string) =>
      updateRotaNoteFn({
        data: {
          rotaId: meta.rotaId,
          note,
        },
      }),
    onSuccess: async (_, note) => {
      setMetaNote(note.trim() || null)
      await queryClient.invalidateQueries({
        queryKey: rotaQueryKeys.all,
      })
      showSuccessToast("Staff notes saved.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not save those staff notes.",
      })
    },
  })

  return {
    isSaving: mutation.isPending,
    saveNote: mutation.mutateAsync,
  }
}

export { useUpdateRotaNote }
