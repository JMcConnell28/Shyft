"use client"

import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { duplicateRotaToNextWeek } from "@/features/rota/server-fns"

function useDuplicateRotaMutation() {
  const duplicateRotaToNextWeekFn = useServerFn(duplicateRotaToNextWeek)

  return useMutation({
    mutationFn: (input: { rotaId: string }) =>
      duplicateRotaToNextWeekFn({
        data: input,
      }),
    meta: {
      successMessage: "Rota copied into the next week.",
      errorMessage: "We could not duplicate that rota.",
    },
  })
}

export { useDuplicateRotaMutation }
