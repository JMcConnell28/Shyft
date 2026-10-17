import { queryOptions } from "@tanstack/react-query"
import {
  getManagerDashboardAccess,
  getManagerDashboardAttention,
  getManagerDashboardDay,
} from "./server-fns"
import { getDashboardPollingInterval } from "./utils/polling"
import type { ManagerDayInput } from "./types"

const managerDashboardKeys = {
  all: ["manager-dashboard"] as const,
  access: (organizationId: string, userId: string) =>
    ["manager-dashboard", "access", organizationId, userId] as const,
  day: (input: ManagerDayInput, userId: string) =>
    [
      "manager-dashboard",
      "day",
      input.organizationId,
      userId,
      input.locationId,
      input.date ?? "today",
    ] as const,
  attention: (organizationId: string, page: number, userId: string) =>
    ["manager-dashboard", "attention", organizationId, userId, page] as const,
}
function managerAccessOptions(organizationId: string, userId: string) {
  return queryOptions({
    queryKey: managerDashboardKeys.access(organizationId, userId),
    queryFn: () => getManagerDashboardAccess({ data: { organizationId } }),
    staleTime: 60000,
    retry: false,
  })
}
function managerDayOptions(input: ManagerDayInput, userId: string) {
  return queryOptions({
    queryKey: managerDashboardKeys.day(input, userId),
    queryFn: () => getManagerDashboardDay({ data: input }),
    staleTime: 15000,
    retry: false,
    retryOnMount: false,
    refetchInterval: (query) =>
      getDashboardPollingInterval(input.date, query.state.data),
    refetchIntervalInBackground: false,
  })
}
function managerAttentionOptions(
  organizationId: string,
  page: number,
  userId: string
) {
  return queryOptions({
    queryKey: managerDashboardKeys.attention(organizationId, page, userId),
    queryFn: () =>
      getManagerDashboardAttention({ data: { organizationId, page } }),
    staleTime: 15000,
    refetchInterval: 60000,
    retry: false,
    retryOnMount: false,
    refetchIntervalInBackground: false,
  })
}
export {
  managerDashboardKeys,
  managerAccessOptions,
  managerDayOptions,
  managerAttentionOptions,
}
