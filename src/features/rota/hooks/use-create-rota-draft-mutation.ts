"use client"

import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { createRotaDraft } from "@/features/rota/server-fns"

function useCreateRotaDraftMutation() {
  const createRotaDraftFn = useServerFn(createRotaDraft)

  return useMutation({
    mutationFn: (input: {
      locationId: string
      weekStart: string
      sourceType: "blank" | "previous-week" | "template"
      templateId?: string | null
    }) =>
      createRotaDraftFn({
        data: input,
      }),
    meta: {
      disableErrorToast: true,
      disableSuccessToast: true,
    },
  })
}

export { useCreateRotaDraftMutation }
