import { useQuery } from "@tanstack/react-query"

import { supportQueryKeys } from "@/features/support/query-keys"
import { getSupportThread } from "@/features/support/server-fns"

function useSupportDetail(id: string) {
  return useQuery({
    queryKey: supportQueryKeys.detail(id),
    queryFn: () => getSupportThread({ data: { id } }),
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  })
}

export { useSupportDetail }
