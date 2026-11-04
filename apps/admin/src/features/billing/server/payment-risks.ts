import "@tanstack/react-start/server-only"
import { getDatabase, queryMany } from "@rocketrota/db"

import type {
  PaymentRisk,
  ReviewPaymentRiskInput,
} from "@/features/billing/schemas/payment-risk-schemas"
import { paymentRiskSchema } from "@/features/billing/schemas/payment-risk-schemas"
import { writeAdminAuditLog } from "@/features/audit/server/audit-log"

async function listPaymentRisks(): Promise<Array<PaymentRisk>> {
  const rows =
    await queryMany(`select id, risk_type as kind, stripe_charge_id as "chargeId",
    stripe_payment_intent_id as "paymentIntentId", stripe_subscription_id as "subscriptionId",
    amount, amount_refunded as "amountRefunded", livemode, created_at as "createdAt"
    from billing_private.payment_risk_reviews where reviewed_at is null order by created_at limit 50`)
  return paymentRiskSchema.array().parse(rows)
}

async function reviewPaymentRisk(
  input: ReviewPaymentRiskInput,
  adminUserId: string
): Promise<{ success: true }> {
  const client = await getDatabase().connect()
  try {
    await client.query("begin")
    const result = await client.query(
      "select reviewed_at from billing_private.payment_risk_reviews where id = $1 for update",
      [input.riskId]
    )
    const row = result.rows[0]
    if (!row) throw new Error("The payment review could not be found.")
    if (!row.reviewed_at) {
      await client.query(
        "update billing_private.payment_risk_reviews set reviewed_at = now(), reviewed_by = $2, review_reason = $3 where id = $1",
        [input.riskId, adminUserId, input.reason]
      )
      await writeAdminAuditLog(
        {
          action: "billing.payment_risk_reviewed",
          adminUserId,
          permission: "billing.risks.review",
          targetType: "payment_risk",
          targetId: input.riskId,
          afterState: { reason: input.reason },
        },
        client
      )
    }
    await client.query("commit")
    return { success: true }
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

export { listPaymentRisks, reviewPaymentRisk }
