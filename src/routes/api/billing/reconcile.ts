import { createFileRoute } from "@tanstack/react-router"

import { reconcileAllBillingAccounts } from "@/features/billing/server/reconciliation"
import { getRequiredEnv } from "@/lib/env.server"

export const Route = createFileRoute("/api/billing/reconcile")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authorization = request.headers.get("authorization")
        const expectedToken = getRequiredEnv("BILLING_RECONCILIATION_SECRET")

        if (authorization !== `Bearer ${expectedToken}`) {
          return Response.json({ error: "Unauthorized." }, { status: 401 })
        }

        const result = await reconcileAllBillingAccounts()

        return Response.json(result)
      },
    },
  },
})
