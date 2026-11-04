import "@tanstack/react-start/server-only"

import { createHash, timingSafeEqual } from "node:crypto"
import { getBillingReconciliationHealth } from "@rocketrota/db/billing-reconciliation"

import {
  reconciliationModeSchema,
  reconciliationSecretSchema,
} from "@/features/billing/schemas/reconciliation-schemas"
import { getOptionalEnv } from "@/lib/env.server"

const privateHeaders = { "Cache-Control": "private, no-store" }
const digest = (value: string) => createHash("sha256").update(value).digest()

async function handleBillingReconciliation(
  request: Request
): Promise<Response> {
  const match = /^Bearer (\S{1,256})$/i.exec(
    request.headers.get("authorization") ?? ""
  )
  if (!match)
    return Response.json(
      { error: "Unauthorized." },
      { status: 401, headers: privateHeaders }
    )
  const configured = reconciliationSecretSchema.safeParse(
    getOptionalEnv("BILLING_RECONCILIATION_SECRET")
  )
  if (!configured.success)
    return Response.json(
      { error: "Billing reconciliation is unavailable." },
      { status: 503, headers: privateHeaders }
    )
  if (!timingSafeEqual(digest(match[1]), digest(configured.data)))
    return Response.json(
      { error: "Unauthorized." },
      { status: 401, headers: privateHeaders }
    )
  const mode = reconciliationModeSchema.safeParse(
    new URL(request.url).searchParams.get("dryRun")
  )
  if (!mode.success)
    return Response.json(
      { error: "Invalid reconciliation mode." },
      { status: 400, headers: privateHeaders }
    )
  try {
    if (mode.data === "1")
      return Response.json(
        { dryRun: true, health: await getBillingReconciliationHealth() },
        { headers: privateHeaders }
      )
    const { reconcileAllBillingAccounts } =
      await import("@/features/billing/server/reconciliation")
    const result = await reconcileAllBillingAccounts()
    return Response.json(result, {
      status: result.failedAccountCount ? 503 : 200,
      headers: privateHeaders,
    })
  } catch {
    console.error(
      "Billing reconciliation failed. Check the scheduled job and the admin billing health panel."
    )
    return Response.json(
      { error: "Billing reconciliation failed. Retry the scheduled job." },
      { status: 503, headers: privateHeaders }
    )
  }
}

export { handleBillingReconciliation }
