import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { getPrivacyRequest, listPrivacyRequests } from "../server-fns"
import { privacyQueryKeys } from "../query-keys"

function usePrivacyRequests(page: number) {
  const fetcher = useServerFn(listPrivacyRequests)
  return useQuery({
    queryKey: privacyQueryKeys.list(page),
    queryFn: () => fetcher({ data: { page } }),
    refetchInterval: 60000,
  })
}
function usePrivacyRequest(id: string) {
  const fetcher = useServerFn(getPrivacyRequest)
  return useQuery({
    queryKey: privacyQueryKeys.detail(id),
    queryFn: () => fetcher({ data: { id } }),
    gcTime: 0,
  })
}
export { usePrivacyRequest, usePrivacyRequests }
