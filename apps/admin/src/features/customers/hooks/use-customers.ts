import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { customersQueryKeys } from "../query-keys"
import {
  getCustomer,
  getCustomerStationTags,
  getCustomers,
  getStationQueue,
  getStationQueueCount,
  setupStationTag,
  updateStationFulfillment,
} from "../server-fns"
import type { CustomerListInput, UpdateFulfillmentInput } from "../schemas"

function useCustomers(input: CustomerListInput) {
  return useQuery({
    queryKey: customersQueryKeys.list(input),
    queryFn: () => getCustomers({ data: input }),
    placeholderData: keepPreviousData,
  })
}
function useCustomer(id: string) {
  return useQuery({
    queryKey: customersQueryKeys.detail(id),
    queryFn: () => getCustomer({ data: { id } }),
    refetchInterval: 60000,
  })
}
function useCustomerTags(id: string, enabled: boolean) {
  return useQuery({
    queryKey: customersQueryKeys.tags(id),
    queryFn: () => getCustomerStationTags({ data: { id } }),
    enabled,
  })
}
function useStationQueue() {
  return useQuery({
    queryKey: customersQueryKeys.queue,
    queryFn: () => getStationQueue(),
    refetchInterval: 60000,
  })
}
function useStationCount() {
  return useQuery({
    queryKey: customersQueryKeys.count,
    queryFn: () => getStationQueueCount(),
    refetchInterval: 60000,
    refetchOnWindowFocus: "always",
  })
}
function useUpdateFulfillment() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateFulfillmentInput) =>
      updateStationFulfillment({ data }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: customersQueryKeys.all }),
  })
}
function useSetupStationTag() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (data: { requestId: string; tagId?: string }) =>
      setupStationTag({ data }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: customersQueryKeys.all }),
  })
}
export {
  useSetupStationTag,
  useCustomers,
  useCustomer,
  useCustomerTags,
  useStationQueue,
  useStationCount,
  useUpdateFulfillment,
}
