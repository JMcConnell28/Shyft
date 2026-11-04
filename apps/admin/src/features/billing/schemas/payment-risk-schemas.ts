import { z } from "zod"

const paymentRiskSchema = z.object({
  id: z.uuid(),
  kind: z.enum(["refund", "dispute", "fraud_warning"]),
  chargeId: z.string().startsWith("ch_"),
  paymentIntentId: z.string().nullable(),
  subscriptionId: z.string().nullable(),
  amount: z.number().int(),
  amountRefunded: z.number().int(),
  livemode: z.boolean(),
  createdAt: z.date().transform((date) => date.toISOString()),
})
const reviewPaymentRiskSchema = z.object({
  riskId: z.uuid(),
  reason: z.string().trim().min(10, "Explain the review outcome.").max(1000),
})

type PaymentRisk = z.output<typeof paymentRiskSchema>
type ReviewPaymentRiskInput = z.input<typeof reviewPaymentRiskSchema>
export { paymentRiskSchema, reviewPaymentRiskSchema }
export type { PaymentRisk, ReviewPaymentRiskInput }
