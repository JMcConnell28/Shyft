import "@tanstack/react-start/server-only"

import type Stripe from "stripe"

import { getDatabase } from "@/lib/db"

type WebhookEventProcessingState = "new" | "retry" | "already-processed"

type StripeWebhookReference = {
  billingAccountId: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

function getStringMetadataValue(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
) {
  const value = metadata?.[key]

  return value && value.length > 0 ? value : null
}

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
) {
  if (!customer) {
    return null
  }

  return typeof customer === "string" ? customer : customer.id
}

function getSubscriptionId(
  subscription:
    | string
    | Stripe.Subscription
    | null
    | undefined,
) {
  if (!subscription) {
    return null
  }

  return typeof subscription === "string" ? subscription : subscription.id
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const subscription =
    invoice.parent?.subscription_details?.subscription ?? null

  return getSubscriptionId(subscription)
}

function getWebhookReference(event: Stripe.Event): StripeWebhookReference {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    return {
      billingAccountId:
        getStringMetadataValue(session.metadata, "billingAccountId") ??
        session.client_reference_id ??
        null,
      stripeCustomerId: getCustomerId(session.customer),
      stripeSubscriptionId: getSubscriptionId(session.subscription),
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object

    return {
      billingAccountId: getStringMetadataValue(
        subscription.metadata,
        "billingAccountId",
      ),
      stripeCustomerId: getCustomerId(subscription.customer),
      stripeSubscriptionId: subscription.id,
    }
  }

  if (
    event.type === "invoice.payment_failed" ||
    event.type === "invoice.paid"
  ) {
    const invoice = event.data.object

    return {
      billingAccountId: null,
      stripeCustomerId: getCustomerId(invoice.customer),
      stripeSubscriptionId: getInvoiceSubscriptionId(invoice),
    }
  }

  return {
    billingAccountId: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  }
}

async function recordStripeWebhookReceived(event: Stripe.Event) {
  const reference = getWebhookReference(event)
  const result = await getDatabase().query<{ processing_status: string }>(
    `insert into public.stripe_webhook_events (
       stripe_event_id,
       event_type,
       api_version,
       livemode,
       billing_account_id,
       stripe_customer_id,
       stripe_subscription_id
     ) values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (stripe_event_id)
     do update set updated_at = timezone('utc', now())
     returning processing_status`,
    [
      event.id,
      event.type,
      event.api_version ?? null,
      event.livemode,
      reference.billingAccountId,
      reference.stripeCustomerId,
      reference.stripeSubscriptionId,
    ],
  )
  const status = result.rows.at(0)?.processing_status

  if (status === "processed") {
    return "already-processed" satisfies WebhookEventProcessingState
  }

  return status === "failed"
    ? ("retry" satisfies WebhookEventProcessingState)
    : ("new" satisfies WebhookEventProcessingState)
}

async function recordStripeWebhookProcessed(event: Stripe.Event) {
  const reference = getWebhookReference(event)

  await getDatabase().query(
    `update public.stripe_webhook_events
     set processing_status = 'processed',
         billing_account_id = coalesce($2, billing_account_id),
         stripe_customer_id = coalesce($3, stripe_customer_id),
         stripe_subscription_id = coalesce($4, stripe_subscription_id),
         error_message = null,
         processed_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     where stripe_event_id = $1`,
    [
      event.id,
      reference.billingAccountId,
      reference.stripeCustomerId,
      reference.stripeSubscriptionId,
    ],
  )
}

async function recordStripeWebhookFailed(event: Stripe.Event, error: unknown) {
  const message =
    error instanceof Error ? error.message : "Webhook processing failed."

  await getDatabase().query(
    `update public.stripe_webhook_events
     set processing_status = 'failed',
         error_message = left($2, 1000),
         updated_at = timezone('utc', now())
     where stripe_event_id = $1`,
    [event.id, message],
  )
}

export {
  recordStripeWebhookFailed,
  recordStripeWebhookProcessed,
  recordStripeWebhookReceived,
}
