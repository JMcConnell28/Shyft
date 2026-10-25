# Stripe environment configuration

These are the variables used by the current RocketRota billing code. Configure
them in the deployed application's server environment, then restart or redeploy.
Local development settings do not configure the deployed application.

## Required for paid subscription checkout

| Variable | Value |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server Stripe API key for the selected account and environment. Prefer a restricted key with the permissions this integration needs. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret (`whsec_...`) for this environment's `/api/stripe/webhook` endpoint. |
| `STRIPE_CORE_BASE_PRICE_ID` | Active monthly fixed Core price (`price_...`): GBP 25.00, quantity 1. |
| `STRIPE_CORE_EXTRA_EMPLOYEE_PRICE_ID` | Active monthly metered extra-employee price (`price_...`): GBP 2.50 per unit. |
| `STRIPE_TIME_ATTENDANCE_EMPLOYEE_PRICE_ID` | Active monthly metered Time & Attendance employee price (`price_...`): GBP 1.00 per unit. |
| `STRIPE_CORE_EXTRA_EMPLOYEE_METER_EVENT_NAME` | Exact event name of the meter attached to the extra-employee price. This is not the meter ID or display name. |
| `STRIPE_TIME_ATTENDANCE_EMPLOYEE_METER_EVENT_NAME` | Exact event name of the meter attached to the Time & Attendance price. |
| `BETTER_AUTH_URL` | Public application origin, including HTTPS in production. Used for Checkout and portal return URLs. |

Subscription checkout validates and attaches all three prices, even when current
extra-employee or Time & Attendance usage is zero. Both metered prices and event
names must therefore be configured before restoring access after an expired trial.
Saving a payment method during an active trial uses setup mode and does not run
this same price validation.

All three subscription prices must use GBP, monthly recurrence with interval
count 1, per-unit billing, exclusive tax, and no quantity transformation. Core
must use licensed usage. The two employee prices must use metered usage and have
an active billing meter with:

- The exact event name configured in the corresponding environment variable.
- Sum aggregation.
- Customer payload key `stripe_customer_id`.
- Value payload key `value`.
- No pre-aggregated event time window.

Prices, meters, API credentials and webhook configuration must belong to the same
Stripe account and live/test environment. The price amounts above are enforced
by `subscription-prices.ts`; an arbitrary existing price will not necessarily work.

## Conditional and optional variables

| Variable | When needed |
| --- | --- |
| `BILLING_RECONCILIATION_SECRET` | Required when calling `POST /api/billing/reconcile`; use the same random secret for the server and authorised caller's Bearer token. |
| `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` | Optional `bpc_...` configuration for Manage billing; omitted means Stripe's default configuration. |
| `STRIPE_EXTRA_CLOCK_STATION_PRICE_ID` | Configure to sell additional clock stations. Must be an active one-time GBP price with a positive amount. |
| `STRIPE_BILLING_CURRENCY` | Optional; defaults to `gbp`. Subscription price validation currently requires GBP regardless of this setting. |

`STRIPE_LOCATION_PRICE_ID` and `STRIPE_EXTRA_EMPLOYEE_PRICE_ID` are old names and
are not read by the current billing code. No Stripe publishable-key variable is
referenced by the current hosted Checkout integration.

## Webhook and tax setup

Configure the primary billing endpoint as:

```text
https://YOUR_APP_DOMAIN/api/stripe/webhook
```

The handler processes these events:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
customer.updated
invoice.payment_failed
invoice.paid
invoice.finalized
invoice.updated
invoice.voided
invoice.marked_uncollectible
charge.refunded
charge.dispute.created
```

Use the signing secret for this endpoint. A separate endpoint or local Stripe CLI
listener has its own secret. Subscription and invoice webhook delivery is required
to keep application access in sync with payments and subscription changes.

Checkout already enables automatic tax. Confirm Stripe Tax has the appropriate
active registrations and settings; enabling automatic tax alone does not establish
a tax registration.

Store credentials in the hosting platform's secret storage and keep them out of
source control and client-side variables. Use separate credentials and Stripe
resources for development and production.

After configuration, test expired-trial Checkout in staging, webhook processing,
restored write access, and metered usage reporting before testing live payments.

References: [Billing meters](https://docs.stripe.com/api/billing/meter),
[subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks),
[Stripe Tax for subscriptions](https://docs.stripe.com/billing/taxes/collect-taxes).
