import { createFileRoute } from "@tanstack/react-router"

import { handleBillingReconciliation } from "@/features/billing/server/reconciliation-endpoint"

export const Route = createFileRoute("/api/billing/reconcile")({
  server: {
    handlers: {
      POST: ({ request }) => handleBillingReconciliation(request),
    },
  },
})
