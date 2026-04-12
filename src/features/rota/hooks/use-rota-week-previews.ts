"use client"

import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { previewRotaCreation } from "@/features/rota/server-fns"

type WeekPreviewSummary = {
  existingRota: boolean
  hasPreviousPublished: boolean
  templateCount: number
  isPending: boolean
}

function useRotaWeekPreviews({
  enabled,
  locationId,
  weekStarts,
}: {
  enabled: boolean
  locationId: string
  weekStarts: Array<string>
}) {
  const previewRotaCreationFn = useServerFn(previewRotaCreation)
  const uniqueWeekStarts = useMemo(
    () => Array.from(new Set(weekStarts)).filter(Boolean),
    [weekStarts],
  )

  const queryResults = useQueries({
    queries: uniqueWeekStarts.map((weekStart) => ({
      enabled: enabled && Boolean(locationId),
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
    })),
  })

  return useMemo(() => {
    return uniqueWeekStarts.reduce<Record<string, WeekPreviewSummary>>(
      (map, weekStart, index) => {
        const result = queryResults[index]
        const preview = result.data

        map[weekStart] = {
          existingRota: Boolean(preview?.existingRota),
          hasPreviousPublished: Boolean(preview?.previousPublished),
          templateCount: preview?.templates.length ?? 0,
          isPending: result.isPending || result.isFetching,
        }

        return map
      },
      {},
    )
  }, [queryResults, uniqueWeekStarts])
}

export { useRotaWeekPreviews }
export type { WeekPreviewSummary }
