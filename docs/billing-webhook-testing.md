# Billing Webhook Test Plan

This checklist verifies that Stripe events update RocketRota billing state correctly.

## Local Setup

Run the app:

```powershell
npm.cmd run dev
```

Forward Stripe webhooks:

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` value into `.env.local`:

```txt
STRIPE_WEBHOOK_SECRET=whsec_...
```

Required Stripe env vars:

```txt
STRIPE_SECRET_KEY=sk_test_...
STRIPE_LOCATION_PRICE_ID=price_...
STRIPE_EXTRA_EMPLOYEE_PRICE_ID=price_...
BETTER_AUTH_URL=http://localhost:3000
```

Inspect local billing state:

```powershell
npm.cmd run billing:webhooks:status -- --location-slug your-location-slug
```

Useful alternatives:

```powershell
npm.cmd run billing:webhooks:status -- --billing-account-id <uuid>
npm.cmd run billing:webhooks:status -- --stripe-customer-id cus_...
npm.cmd run billing:webhooks:status -- --events 20
```

## What The Status Script Shows

The script prints:

- the billing account
- covered locations
- billing subscriptions
- workspace trial
- recent Stripe webhook events

Webhook rows should end in `processing_status = processed`.

If a row is `failed`, read `error_message`, fix the issue, then resend the event from Stripe.

## Event Checklist

### 1. Checkout Completed During Active Trial

Flow:

1. Make sure the workspace trial is active.
2. Open billing settings.
3. Click `Add payment method`.
4. Complete Stripe Checkout with a test card.

Expected Stripe mode:

- `setup`

Expected database:

- `billing_accounts.stripe_customer_id` is set.
- `billing_accounts.stripe_payment_method_id` is set.
- `billing_accounts.status` is `payment_method_saved` or `trialing`.
- `billing_subscriptions.status` is `trialing` once the trial subscription is created.
- `stripe_webhook_events` contains processed `checkout.session.completed`.

Expected UI:

- Billing settings shows card/payment method saved.
- No payment should be taken immediately.

### 2. Trial Expired Checkout

Flow:

1. Use dev trial controls to set the trial to expired.
2. Click `Choose plan`.
3. Complete Stripe Checkout.

Expected Stripe mode:

- `subscription`

Expected database:

- `billing_subscriptions.status` becomes `active` or `trialing` depending on Stripe response.
- `billing_accounts.status` matches the subscription status.
- `stripe_webhook_events` contains processed `checkout.session.completed`.

Expected UI:

- `/billing/expired` no longer blocks the workspace once Stripe sync completes.

### 3. Subscription Created Or Updated

Trigger:

- Complete checkout, update a subscription in Stripe, or resend the event from Stripe.

Expected database:

- `billing_subscriptions` is inserted or updated by `stripe_subscription_id`.
- `billing_accounts.status` matches Stripe.
- `current_period_start`, `current_period_end`, and `cancel_at_period_end` sync from Stripe.

Expected webhook events:

- `customer.subscription.created` or `customer.subscription.updated` is `processed`.

### 4. Failed Payment

Trigger with Stripe test tools or a failing card.

Expected database:

- `billing_subscriptions.status` becomes `past_due`.
- `billing_subscriptions.past_due_started_at` is set.
- `billing_accounts.status` becomes `past_due`.

Expected UI:

- Managers see a payment failed warning.
- Workspace remains accessible during the 5-day grace period.

### 5. Paid Recovery

Flow:

1. Resolve the invoice in Stripe.
2. Or trigger/resend `invoice.paid`.

Expected database:

- subscription status returns to `active` or the latest Stripe status.
- `past_due_started_at` clears when the subscription is no longer `past_due`.

Expected UI:

- Payment warning disappears.
- Access remains/restores.

### 6. Grace Period End

Flow:

1. Put a subscription into `past_due`.
2. Set `past_due_started_at` older than 5 days in local development.
3. Refresh the workspace.

Expected UI:

- Manager is redirected to `/billing/expired`.
- CTA is `Update payment method` or `Manage billing`.

### 7. Cancellation

Flow:

1. Cancel the subscription in Stripe.
2. Wait for webhook or resend the event.

Expected database:

- `billing_subscriptions.status` becomes `canceled`.
- `billing_accounts.status` becomes `canceled`.

Expected UI:

- Workspace is blocked after trial/paid access is no longer valid.
- CTA is `Choose plan`.

### 8. Duplicate Webhook Delivery

Flow:

1. Resend an already processed Stripe event.

Expected database:

- No duplicate subscription rows are created.
- `stripe_webhook_events` keeps one row per `stripe_event_id`.

Expected API:

- webhook returns success with duplicate handling.

### 9. Duplicate Subscription Protection

Flow:

1. Complete checkout.
2. Try to start checkout again for the same workspace.

Expected app behavior:

- checkout is blocked.
- user is told to use Manage billing.

Expected database:

- only one open local subscription exists for the billing account.

### 10. Dynamic Quantity Sync

Flow:

1. Test with 10 or fewer counted employees.
2. Add or invite the 11th counted employee.
3. Assign/deactivate employees during the current billing period.

Expected Stripe:

- location price quantity equals covered location count.
- extra employee price is absent at 10 or fewer included employees.
- extra employee price quantity equals employees above the included allowance.

Expected database:

- status script shows updated active/billable employee counts through billing state.

## Production Endpoint

When deployed, configure Stripe to send webhooks to:

```txt
https://your-production-domain.com/api/stripe/webhook
```

Use only the production webhook signing secret in production.

The legacy-compatible route also exists:

```txt
/api/auth/stripe/webhook
```

Prefer `/api/stripe/webhook` for new Stripe configuration.
