import { queryOptions } from "@tanstack/react-query"

import {
  getSupportLocations,
  getSupportNotifications,
  getSupportThread,
  listSupportThreads,
} from "@/features/support/server-fns"

const supportQueryKeys = {
  all: ["customer-support"] as const,
  list: (organizationId: string, page: number) =>
    ["customer-support", organizationId, "list", page] as const,
  lists: (organizationId: string) =>
    ["customer-support", organizationId, "list"] as const,
  detail: (organizationId: string, threadId: string) =>
    ["customer-support", organizationId, "detail", threadId] as const,
  notifications: (organizationId: string) =>
    ["customer-support", organizationId, "notifications"] as const,
  locations: (organizationId: string) =>
    ["customer-support", organizationId, "locations"] as const,
}

function supportThreadsQueryOptions(organizationId: string, page: number) {
  return queryOptions({
    queryKey: supportQueryKeys.list(organizationId, page),
    queryFn: () => listSupportThreads({ data: { organizationId, page } }),
    refetchOnWindowFocus: "always",
  })
}

function supportThreadQueryOptions(organizationId: string, threadId: string) {
  return queryOptions({
    queryKey: supportQueryKeys.detail(organizationId, threadId),
    queryFn: () => getSupportThread({ data: { organizationId, threadId } }),
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  })
}

function supportNotificationsQueryOptions(organizationId: string) {
  return queryOptions({
    queryKey: supportQueryKeys.notifications(organizationId),
    queryFn: () => getSupportNotifications({ data: { organizationId } }),
    refetchOnWindowFocus: "always",
  })
}

function supportLocationsQueryOptions(organizationId: string) {
  return queryOptions({
    queryKey: supportQueryKeys.locations(organizationId),
    queryFn: () => getSupportLocations({ data: { organizationId } }),
  })
}

export {
  supportNotificationsQueryOptions,
  supportLocationsQueryOptions,
  supportQueryKeys,
  supportThreadQueryOptions,
  supportThreadsQueryOptions,
}
