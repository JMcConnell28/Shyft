"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { clockStationsQueryKeys } from "@/features/clock-stations/query-keys"
import { getClockStations } from "@/features/clock-stations/server-fns"

function useClockStationsQuery() {
  const getClockStationsFn = useServerFn(getClockStations)

  return useQuery({
    queryKey: clockStationsQueryKeys.all,
    queryFn: () => getClockStationsFn(),
  })
}

export { useClockStationsQuery }
