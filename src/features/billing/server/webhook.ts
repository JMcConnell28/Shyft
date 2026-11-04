import "@tanstack/react-start/server-only"

import {
  syncStripeCustomerTaxState,
  syncSubscriptionFromInvoice,
  upsertStripeCheckoutSession,
  upsertStripeSubscription,
} from "@/features/billing/server/subscriptions"
import { sendPaymentFailedNotification } from "@/features/billing/server/email-notifications"
import { getStripe } from "@/features/billing/server/stripe"
import { recordStationPayment } from "@/features/billing/server/station-payments"
import { sendPendingStationAlerts } from "@/features/billing/server/station-alerts"
import {
  recordStripeWebhookFailed,
  recordStripeWebhookProcessed,
  recordStripeWebhookReceived,
} from "@/features/billing/server/webhook-events"
import {
  holdRefundedStation,
  syncStationCheckout,
} from "@/features/station-purchases/server/payments"
import { getRequiredEnv } from "@/lib/env.server"
import { acquireBillingProcessingLock } from "@/features/billing/server/processing-locks"
import { recordPaymentRisk } from "@/features/billing/server/payment-risks"

async function handleStripeWebhook(request: Request) {
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return Response.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    )
  }

  const payload = await request.text()
  const stripe = getStripe()
  let event

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      getRequiredEnv("STRIPE_WEBHOOK_SECRET")
    )
  } catch {
    return Response.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    )
  }

  const claim = await acquireBillingProcessingLock("event", event.id)
  if (!claim)
    return Response.json(
      { error: "Webhook processing is busy. Please retry." },
      { status: 503, headers: { "Retry-After": "10" } }
    )
  try {
    const processingState = await recordStripeWebhookReceived(event)
    claim.assertHeld()

    if (processingState === "already-processed") {
      return Response.json({ duplicate: true, received: true })
    }

    try {
      if (event.type === "checkout.session.completed") {
        await upsertStripeCheckoutSession(event.data.object)
        await syncStationCheckout(event.data.object)
        await sendPendingStationAlerts()
      } else if (
        event.type === "checkout.session.async_payment_succeeded" ||
        event.type === "checkout.session.async_payment_failed" ||
        event.type === "checkout.session.expired"
      ) {
        await syncStationCheckout(
          event.data.object,
          event.type === "checkout.session.async_payment_failed"
        )
        await sendPendingStationAlerts()
      } else if (event.type === "charge.refunded") {
        await holdRefundedStation(event.data.object.payment_intent, "refunded")
        await recordPaymentRisk(event)
      } else if (event.type === "charge.dispute.created") {
        await holdRefundedStation(event.data.object.payment_intent, "disputed")
        await recordPaymentRisk(event)
      } else if (event.type === "radar.early_fraud_warning.created") {
        await recordPaymentRisk(event)
      } else if (
        event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.updated" ||
        event.type === "customer.subscription.deleted"
      ) {
        await upsertStripeSubscription(event.data.object)
      } else if (event.type === "customer.updated") {
        await syncStripeCustomerTaxState(event.data.object)
      } else if (
        event.type === "invoice.payment_failed" ||
        event.type === "invoice.paid" ||
        event.type === "invoice.finalized" ||
        event.type === "invoice.updated" ||
        event.type === "invoice.voided" ||
        event.type === "invoice.marked_uncollectible"
      ) {
        const subscription = await syncSubscriptionFromInvoice(
          event.data.object
        )

        if (
          event.type === "invoice.paid" &&
          subscription?.status === "active"
        ) {
          await recordStationPayment(event.data.object, subscription)
          await sendPendingStationAlerts()
        }

        if (
          event.type === "invoice.payment_failed" &&
          subscription &&
          ["past_due", "unpaid", "incomplete"].includes(subscription.status)
        ) {
          await sendPaymentFailedNotification(subscription, event.id)
        }
      }

      claim.assertHeld()
      await recordStripeWebhookProcessed(event)
    } catch (error) {
      await recordStripeWebhookFailed(event, error)

      return Response.json(
        { error: "Stripe webhook processing failed." },
        { status: 500 }
      )
    }

    return Response.json({ received: true })
  } finally {
    await claim.release()
  }
}

export { handleStripeWebhook }
