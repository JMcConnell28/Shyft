import "@tanstack/react-start/server-only"

import type Stripe from "stripe"

import { ensureWorkspaceTrial } from "@/features/billing/server/trials"
import {
  ensureLocationBillingAccount,
  ensureOrganizationBillingAccount,
  setBillingAccountStripeCustomer,
} from "@/features/billing/server/billing-accounts"
import {
  buildSubscriptionLineItems,
  getBillingPricingQuantities,
} from "@/features/billing/server/pricing"
import { getBillingCurrency, getStripe } from "@/features/billing/server/stripe"
import {
  buildAppUrl,
  getSafeAppReturnPath,
} from "@/features/billing/server/urls"
import {
  findOpenStripeSubscriptionForBillingAccount,
  getOpenBillingSubscription,
} from "@/features/billing/server/subscriptions"

type CheckoutWorkspaceInput = {
  organizationId?: string
  locationId?: string
  returnPath?: string
  user: {
    id: string
    email: string
    name: string
  }
}

type CheckoutSessionResult = {
  checkoutUrl: string
}

async function getWorkspaceTrialEndTimestamp(input: {
  organizationId?: string
  locationId?: string
}) {
  const trial = await ensureWorkspaceTrial({
    organizationId: input.organizationId,
    locationId: input.locationId,
  })
  const trialEndsAt = new Date(trial.trialEndsAt)

  if (trial.status !== "trialing" || trialEndsAt.getTime() <= Date.now()) {
    return null
  }

  return Math.floor(trialEndsAt.getTime() / 1000)
}

function isMissingStripeResource(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "resource_missing"
  )
}

async function createStripeCustomer(input: {
  billingAccountId: string
  user: CheckoutWorkspaceInput["user"]
}) {
  const customer = await getStripe().customers.create({
    email: input.user.email,
    name: input.user.name,
    metadata: {
      billingAccountId: input.billingAccountId,
      userId: input.user.id,
    },
  })

  await setBillingAccountStripeCustomer({
    billingAccountId: input.billingAccountId,
    stripeCustomerId: customer.id,
  })

  return customer.id
}

async function getUsableStripeCustomerId(input: {
  billingAccount: {
    id: string
    stripe_customer_id: string | null
  }
  user: CheckoutWorkspaceInput["user"]
}) {
  const existingCustomerId = input.billingAccount.stripe_customer_id

  if (!existingCustomerId) {
    return createStripeCustomer({
      billingAccountId: input.billingAccount.id,
      user: input.user,
    })
  }

  try {
    const customer = await getStripe().customers.retrieve(existingCustomerId)

    if (isDeletedStripeCustomer(customer)) {
      return createStripeCustomer({
        billingAccountId: input.billingAccount.id,
        user: input.user,
      })
    }

    return customer.id
  } catch (error) {
    if (isMissingStripeResource(error)) {
      return createStripeCustomer({
        billingAccountId: input.billingAccount.id,
        user: input.user,
      })
    }

    throw error
  }
}

function isDeletedStripeCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer
): customer is Stripe.DeletedCustomer {
  return "deleted" in customer && customer.deleted === true
}

async function createSubscriptionCheckoutSession(
  input: CheckoutWorkspaceInput
) {
  const stripe = getStripe()
  const billingAccount = input.organizationId
    ? await ensureOrganizationBillingAccount({
        organizationId: input.organizationId,
        ownerUserId: input.user.id,
      })
    : await ensureLocationBillingAccount({
        locationId: input.locationId ?? "",
        ownerUserId: input.user.id,
      })
  const stripeCustomerId = await getUsableStripeCustomerId({
    billingAccount,
    user: input.user,
  })
  const existingDatabaseSubscription = await getOpenBillingSubscription(
    billingAccount.id
  )

  if (existingDatabaseSubscription) {
    throw new Error(
      "This workspace already has a subscription. Use Manage billing to update it."
    )
  }

  const existingStripeSubscription =
    await findOpenStripeSubscriptionForBillingAccount({
      billingAccountId: billingAccount.id,
      stripeCustomerId,
    })

  if (existingStripeSubscription) {
    throw new Error(
      "This workspace already has a subscription. Use Manage billing to update it."
    )
  }

  const trialEnd = await getWorkspaceTrialEndTimestamp({
    organizationId: input.organizationId,
    locationId: input.locationId,
  })

  if (trialEnd) {
    return createPaymentMethodSetupCheckoutSession({
      billingAccountId: billingAccount.id,
      input,
      stripeCustomerId,
    })
  }

  const quantities = await getBillingPricingQuantities(billingAccount.id)
  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
    {
      metadata: {
        billingAccountId: billingAccount.id,
        organizationId: input.organizationId ?? "",
        locationId: input.locationId ?? "",
        locationQuantity: String(quantities.locationQuantity),
        usedEmployeeQuantity: String(quantities.usedEmployeeQuantity),
        includedEmployeeQuantity: String(quantities.includedEmployeeQuantity),
        billableEmployeeQuantity: String(quantities.extraEmployeeQuantity),
        extraEmployeeQuantity: String(quantities.extraEmployeeQuantity),
        timeAttendanceEmployeeQuantity: String(quantities.timeAttendanceQuantity),
      },
    }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    client_reference_id: billingAccount.id,
    payment_method_collection: "always",
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: true },
    submit_type: "subscribe",
    line_items: buildSubscriptionLineItems(quantities),
    metadata: {
      billingAccountId: billingAccount.id,
      organizationId: input.organizationId ?? "",
      locationId: input.locationId ?? "",
      locationQuantity: String(quantities.locationQuantity),
      usedEmployeeQuantity: String(quantities.usedEmployeeQuantity),
      includedEmployeeQuantity: String(quantities.includedEmployeeQuantity),
      billableEmployeeQuantity: String(quantities.extraEmployeeQuantity),
      extraEmployeeQuantity: String(quantities.extraEmployeeQuantity),
      timeAttendanceEmployeeQuantity: String(quantities.timeAttendanceQuantity),
    },
    subscription_data: {
      ...subscriptionData,
    },
    success_url: buildAppUrl(
      "/billing/success?session_id={CHECKOUT_SESSION_ID}"
    ),
    cancel_url: buildAppUrl(
      getSafeAppReturnPath(input.returnPath, "/billing/expired")
    ),
  })

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.")
  }

  return {
    checkoutUrl: session.url,
  }
}

async function createPaymentMethodSetupCheckoutSession(input: {
  billingAccountId: string
  input: CheckoutWorkspaceInput
  stripeCustomerId: string
}): Promise<CheckoutSessionResult> {
  const session = await getStripe().checkout.sessions.create({
    mode: "setup",
    customer: input.stripeCustomerId,
    currency: getBillingCurrency(),
    client_reference_id: input.billingAccountId,
    setup_intent_data: {
      metadata: {
        billingAccountId: input.billingAccountId,
        organizationId: input.input.organizationId ?? "",
        locationId: input.input.locationId ?? "",
      },
    },
    metadata: {
      billingAccountId: input.billingAccountId,
      organizationId: input.input.organizationId ?? "",
      locationId: input.input.locationId ?? "",
    },
    custom_text: {
      submit: {
        message:
          "Your card will be saved now. Your first payment is taken when your RocketRota trial ends.",
      },
    },
    success_url: buildAppUrl(
      "/billing/success?session_id={CHECKOUT_SESSION_ID}"
    ),
    cancel_url: buildAppUrl(
      getSafeAppReturnPath(input.input.returnPath, "/billing/expired")
    ),
  })

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.")
  }

  return {
    checkoutUrl: session.url,
  }
}

export { createSubscriptionCheckoutSession }
