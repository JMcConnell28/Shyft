import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { SupportCategory } from "@/features/support/types"
import { supportQueryKeys } from "@/features/support/query-options"
import {
  createSupportThread,
  replyToSupportThread,
} from "@/features/support/server-fns"
import { showSuccessToast } from "@/lib/toast"

function useSupportMutations(organizationId: string) {
  const queryClient = useQueryClient()

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: supportQueryKeys.all })
  }

  return {
    createMutation: useMutation({
      mutationFn: (input: {
        subject: string
        category: SupportCategory
        locationId: string | null
        body: string
      }) => createSupportThread({ data: { ...input, organizationId } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Support request sent.")
      },
    }),
    replyMutation: useMutation({
      mutationFn: (input: { threadId: string; body: string }) =>
        replyToSupportThread({ data: { ...input, organizationId } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Reply sent.")
      },
    }),
  }
}

export { useSupportMutations }
