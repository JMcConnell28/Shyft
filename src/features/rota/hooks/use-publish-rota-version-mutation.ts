"use client"

import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { publishRotaVersion } from "@/features/rota/server-fns"

function usePublishRotaVersionMutation() {
  const publishRotaVersionFn = useServerFn(publishRotaVersion)

  return useMutation({
    mutationFn: (input: { rotaId: string }) =>
      publishRotaVersionFn({
        data: input,
      }),
    meta: {
      successMessage: "Rota published.",
      errorMessage: "We could not publish that rota.",
    },
  })
}

export { usePublishRotaVersionMutation }
