import { useQuery } from "@tanstack/react-query"

import { supportQueryKeys } from "@/features/support/query-keys"
import { getUnreadSupportCount } from "@/features/support/server-fns"

function useSupportUnreadCount() {
  return useQuery({
    queryKey: supportQueryKeys.unread,
    queryFn: () => getUnreadSupportCount(),
    refetchOnWindowFocus: "always",
  })
}

export { useSupportUnreadCount }
