"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { previewRotaCreation } from "@/features/rota/server-fns"

function useRotaCreationPreviewQuery({
  enabled,
  locationId,
  weekStart,
}: {
  enabled: boolean
  locationId: string
  weekStart: string
}) {
  const previewRotaCreationFn = useServerFn(previewRotaCreation)

  return useQuery({
    enabled: enabled && Boolean(locationId) && Boolean(weekStart),
    queryKey: rotaQueryKeys.creationPreview({
      locationId,
      weekStart,
    }),
    queryFn: () =>
      previewRotaCreationFn({
        data: {
          locationId,
          weekStart,
        },
      }),
  })
}

export { useRotaCreationPreviewQuery }
