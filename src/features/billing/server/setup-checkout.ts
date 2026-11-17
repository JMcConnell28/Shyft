import "@tanstack/react-start/server-only"

import type Stripe from "stripe"
import { RENEWAL_CANCELED_AT_METADATA_KEY } from "@/features/billing/constants"
import { setBillingAccountPaymentMethod } from "@/features/billing/server/billing-accounts"
import { getBillingPricingQuantities } from "@/features/billing/server/pricing"
import { getStripe } from "@/features/billing/server/stripe"
import { buildSubscriptionItems } from "@/features/billing/server/subscription-items"
import {
  findOpenStripeSubscriptionForBillingAccount,
  getOpenBillingSubscription,
  upsertStripeSubscription,
} from "@/features/billing/server/subscriptions"
import { ensureWorkspaceTrial } from "@/features/billing/server/trials"
import { withWorkspaceBillingLock } from "@/features/billing/server/workspace-billing-lock"
import { getDatabase } from "@/lib/db"

type SetupCheckoutSession = Pick<
  Stripe.Checkout.Session,
  "id" | "status" | "created" | "customer" | "setup_intent" | "metadata"
>

async function upsertSetupCheckoutSession(
  session: SetupCheckoutSession,
  billingAccountId: string | null
) {
  if (session.status !== "complete" || !session.setup_intent) {
    return
  }
  if (!billingAccountId) {
    throw new Error("Setup checkout session is missing a billing account.")
  }

  const setupIntentId =
    typeof session.setup_intent === "string"
      ? session.setup_intent
      : session.setup_intent.id
  const account = await readSetupCheckoutAccount(billingAccountId)
  if (!account) return

  await withWorkspaceBillingLock(
    account.organization_id,
    async (assertHeld) => {
      // A completed Checkout event can arrive after the organisation was removed.
      const currentAccount = await readSetupCheckoutAccount(billingAccountId)
      if (!currentAccount) return
      if (currentAccount.organization_id !== account.organization_id) {
        throw new Error("Billing changed while processing Checkout. Try again.")
      }
      await applySetupCheckoutSession(
        session,
        billingAccountId,
        setupIntentId,
        assertHeld
      )
    }
  )
}

async function readSetupCheckoutAccount(billingAccountId: string) {
  const result = await getDatabase().query<{ organization_id: string | null }>(
    `select coalesce(account.organization_id, location.organization_id) as organization_id
     from public.billing_accounts account
     left join public.locations location on location.id = account.location_id
     where account.id = $1 and (account.organization_id is not null or location.id is not null)`,
    [billingAccountId]
  )
  return result.rows.at(0)
}

async function applySetupCheckoutSession(
  session: SetupCheckoutSession,
  billingAccountId: string,
  setupIntentId: string,
  assertHeld: () => void
) {
  // Reopening an old success URL after cancellation must never start a new plan.
  const newerSubscription = await getDatabase().query(
    `select 1 from public.billing_subscriptions
     where billing_account_id = $1 and created_at >= to_timestamp($2)
     limit 1`,
    [billingAccountId, session.created]
  )
  if (newerSubscription.rows.length > 0) return

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id
  if (!stripeCustomerId) return

  const customer = await getStripe().customers.retrieve(stripeCustomerId)
  if (
    customer.deleted ||
    session.created <=
      Number(customer.metadata[RENEWAL_CANCELED_AT_METADATA_KEY])
  ) {
    return
  }

  const setupIntent = await getStripe().setupIntents.retrieve(setupIntentId)
  const paymentMethodId =
    typeof setupIntent.payment_method === "string"
      ? setupIntent.payment_method
      : setupIntent.payment_method?.id

  if (!paymentMethodId || setupIntent.status !== "succeeded") {
    return
  }

  assertHeld()
  await getStripe().customers.update(stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  })

  await setBillingAccountPaymentMethod({
    billingAccountId,
    stripePaymentMethodId: paymentMethodId,
  })
  await createTrialSubscriptionForSavedPaymentMethod(
    {
      billingAccountId,
      checkoutSessionId: session.id,
      locationId: getOptionalMetadataValue(session.metadata?.locationId),
      organizationId: getOptionalMetadataValue(
        session.metadata?.organizationId
      ),
      stripeCustomerId,
      stripePaymentMethodId: paymentMethodId,
    },
    assertHeld
  )
}

function getOptionalMetadataValue(value: string | null | undefined) {
  return value && value.length > 0 ? value : undefined
}

async function createTrialSubscriptionForSavedPaymentMethod(
  input: {
    billingAccountId: string
    checkoutSessionId: string
    locationId?: string
    organizationId?: string
    stripeCustomerId?: string
    stripePaymentMethodId: string
  },
  assertHeld: () => void
) {
  if (!input.stripeCustomerId) {
    return null
  }

  const existingDatabaseSubscription = await getOpenBillingSubscription(
    input.billingAccountId
  )

  if (existingDatabaseSubscription) {
    return null
  }

  const existingStripeSubscription =
    await findOpenStripeSubscriptionForBillingAccount({
      billingAccountId: input.billingAccountId,
      stripeCustomerId: input.stripeCustomerId,
    })

  if (existingStripeSubscription) {
    return existingStripeSubscription
  }

  const trial = await ensureWorkspaceTrial({
    organizationId: input.organizationId,
    locationId: input.locationId,
  })
  const trialEnd = getFutureTrialEndTimestamp(trial.trialEndsAt)
  const quantities = await getBillingPricingQuantities(input.billingAccountId)
  const items = await buildSubscriptionItems()
  assertHeld()
  const subscription = await getStripe().subscriptions.create(
    {
      customer: input.stripeCustomerId,
      default_payment_method: input.stripePaymentMethodId,
      items,
      automatic_tax: { enabled: true },
      metadata: {
        billingAccountId: input.billingAccountId,
        organizationId: input.organizationId ?? "",
        locationId: input.locationId ?? "",
        locationQuantity: String(quantities.locationQuantity),
        usedEmployeeQuantity: String(quantities.usedEmployeeQuantity),
        includedEmployeeQuantity: String(quantities.includedEmployeeQuantity),
        billableEmployeeQuantity: String(quantities.extraEmployeeQuantity),
        extraEmployeeQuantity: String(quantities.extraEmployeeQuantity),
        timeAttendanceEmployeeQuantity: String(
          quantities.timeAttendanceQuantity
        ),
        createdFrom: "saved_payment_method",
      },
      ...(trialEnd ? { trial_end: trialEnd } : {}),
    },
    { idempotencyKey: `setup-subscription:${input.checkoutSessionId}` }
  )

  await upsertStripeSubscription(subscription)

  return subscription
}

function getFutureTrialEndTimestamp(trialEndsAt: string) {
  const timestamp = Math.floor(new Date(trialEndsAt).getTime() / 1000)

  return timestamp > Math.floor(Date.now() / 1000) ? timestamp : null
}

export { upsertSetupCheckoutSession }
