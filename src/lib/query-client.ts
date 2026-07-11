import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"

import { getAppMutationMeta, getAppQueryMeta } from "@/lib/query-toast-meta"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function createQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const meta = getAppMutationMeta(mutation.meta)

        if (meta.disableErrorToast) {
          return
        }

        showErrorToast(error, {
          fallbackMessage:
            meta.errorMessage ?? "We could not finish that action.",
        })
      },
      onSuccess: (_data, _variables, _context, mutation) => {
        const meta = getAppMutationMeta(mutation.meta)

        if (meta.disableSuccessToast || !meta.successMessage) {
          return
        }

        showSuccessToast(meta.successMessage)
      },
    }),
    queryCache: new QueryCache({
      onError: (error, query) => {
        const meta = getAppQueryMeta(query.meta)

        if (meta.disableErrorToast || !meta.errorMessage) {
          return
        }

        showErrorToast(error, {
          fallbackMessage: meta.errorMessage,
        })
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export { createQueryClient }
