import { useQuery } from "@tanstack/react-query"

import {
  supportThreadQueryOptions,
  supportThreadsQueryOptions,
} from "@/features/support/query-options"

function useSupportThreads(organizationId: string, page: number) {
  return useQuery(supportThreadsQueryOptions(organizationId, page))
}

function useSupportThread(organizationId: string, threadId: string) {
  return useQuery(supportThreadQueryOptions(organizationId, threadId))
}

export { useSupportThread, useSupportThreads }
