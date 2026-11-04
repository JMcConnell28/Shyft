import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { ReviewPaymentRiskInput } from "@/features/billing/schemas/payment-risk-schemas"
import { billingQueryKeys } from "@/features/billing/query-keys"
import { reviewPaymentRiskServerFn } from "@/features/billing/server-fns"

function usePaymentRiskReview() {
  const queryClient = useQueryClient()
  const review = useServerFn(reviewPaymentRiskServerFn)
  return useMutation({
    mutationFn: (input: ReviewPaymentRiskInput) => review({ data: input }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.all }),
  })
}

export { usePaymentRiskReview }
