# Billing Reconciliation

Billing webhooks update RocketRota as Stripe events arrive. Reconciliation is the safety net for missed, delayed, or failed webhooks.

The reconciliation job:

1. Finds every billing account with a Stripe customer.
2. Lists that customer's Stripe subscriptions.
3. Syncs matching subscriptions back into `billing_subscriptions`.
4. Updates dynamic subscription quantities for locations and extra employees.
5. Records a row in `billing_reconciliation_runs`.

## Required Environment

```txt
BETTER_AUTH_URL=http://localhost:3000
BILLING_RECONCILIATION_SECRET=replace-with-a-long-random-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_LOCATION_PRICE_ID=price_...
STRIPE_EXTRA_EMPLOYEE_PRICE_ID=price_...
```

## Local Run

Start the app:

```powershell
npm.cmd run dev
```

Run reconciliation:

```powershell
npm.cmd run billing:reconcile
```

The script calls:

```txt
POST /api/billing/reconcile
Authorization: Bearer <BILLING_RECONCILIATION_SECRET>
```

## Production Scheduling

In production, schedule an authenticated POST to:

```txt
https://your-production-domain.com/api/billing/reconcile
```

Recommended schedule:

- every 15-30 minutes while early in beta
- hourly once billing is stable
- immediately after any known Stripe outage or webhook incident

Use a long random `BILLING_RECONCILIATION_SECRET` and store it only in server/cron secrets.

## Expected Result Shape

```json
{
  "runId": "uuid",
  "checkedAccountCount": 1,
  "syncedSubscriptionCount": 1,
  "syncedQuantityCount": 1,
  "failedAccountCount": 0,
  "accounts": []
}
```

Any failed account appears in `accounts` with `status: "failed"` and an `errorMessage`.
