"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { eventsQueryKeys } from "@/features/events/query-keys"
import { getEvents } from "@/features/events/server-fns"

function useEventsQuery() {
  const getEventsFn = useServerFn(getEvents)

  return useQuery({
    queryKey: eventsQueryKeys.all,
    queryFn: () => getEventsFn(),
  })
}

export { useEventsQuery }
