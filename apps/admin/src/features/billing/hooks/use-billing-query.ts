"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { billingQueryKeys } from "@/features/billing/query-keys"
import { getBillingPageData } from "@/features/billing/server-fns"

function useBillingQuery() {
  const getBillingPageDataFn = useServerFn(getBillingPageData)

  return useQuery({
    queryKey: billingQueryKeys.all,
    queryFn: () => getBillingPageDataFn(),
  })
}

export { useBillingQuery }
