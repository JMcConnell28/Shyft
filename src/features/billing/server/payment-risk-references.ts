import "@tanstack/react-start/server-only"
import type Stripe from "stripe"

import {
  riskChargeSchema,
  riskInvoiceSchema,
} from "@/features/billing/schemas/payment-risk-schemas"
import { getStripe } from "@/features/billing/server/stripe"

type PaymentRiskEvent = Extract<
  Stripe.Event,
  {
    type:
      | "charge.refunded"
      | "charge.dispute.created"
      | "radar.early_fraud_warning.created"
  }
>

async function resolvePaymentRiskReferences(event: PaymentRiskEvent) {
  const stripe = getStripe()
  const reference =
    event.type === "charge.refunded"
      ? event.data.object
      : event.data.object.charge
  const chargeId = typeof reference === "string" ? reference : reference.id
  const charge = riskChargeSchema.parse(await stripe.charges.retrieve(chargeId))
  const subscriptionIds = new Set<string>()
  if (charge.payment_intent) {
    const payments = await stripe.invoicePayments.list({
      payment: {
        type: "payment_intent",
        payment_intent: charge.payment_intent,
      },
      limit: 100,
      expand: ["data.invoice"],
    })
    if (payments.has_more)
      throw new Error(
        "Payment has too many linked invoices to reconcile safely in one webhook."
      )
    for (const payment of payments.data) {
      const invoice =
        typeof payment.invoice === "string"
          ? await stripe.invoices.retrieve(payment.invoice)
          : payment.invoice
      const parsed = riskInvoiceSchema.parse(invoice)
      const id = parsed.parent?.subscription_details?.subscription
      if (id) subscriptionIds.add(id)
    }
  }
  return { charge, subscriptionIds: [...subscriptionIds] }
}

export { resolvePaymentRiskReferences }
export type { PaymentRiskEvent }
