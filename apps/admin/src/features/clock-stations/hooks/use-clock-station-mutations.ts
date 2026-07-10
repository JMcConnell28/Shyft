"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { clockStationsQueryKeys } from "@/features/clock-stations/query-keys"
import { generateClockStationTagServerFn } from "@/features/clock-stations/server-fns"

function useClockStationMutations() {
  const queryClient = useQueryClient()
  const generateClockStationTag = useServerFn(generateClockStationTagServerFn)

  return {
    generateTagMutation: useMutation({
      mutationFn: (input: { locationId: string }) =>
        generateClockStationTag({ data: input }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: clockStationsQueryKeys.all,
        })
      },
    }),
  }
}

export { useClockStationMutations }
