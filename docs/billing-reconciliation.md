# Billing Reconciliation

Billing webhooks update RocketRota as Stripe events arrive. Reconciliation is the safety net for missed, delayed, or failed webhooks.

The reconciliation job:

1. Finds every billing account with a Stripe customer.
2. Lists that customer's Stripe subscriptions.
3. Syncs matching subscriptions back into `billing_subscriptions`.
4. Updates dynamic subscription quantities for locations and extra employees.
5. Records a row in `billing_reconciliation_runs`.

## Required Environment

Configure the billing variables and price/meter requirements in
[Stripe environment configuration](stripe-environment.md). The HTTP reconciliation
endpoint additionally requires:

```txt
BETTER_AUTH_URL=http://localhost:3000
BILLING_RECONCILIATION_SECRET=<random-secret-at-least-32-characters>
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

To check authorization and read the latest job health without running the job:

```powershell
npm.cmd run billing:reconcile -- --dry-run
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

Configure the scheduler to report non-success responses. Missing or invalid
authorization returns 401. Unavailable configuration or a failed run returns
503. Admin Billing shows a warning when the last run failed, a run is still
marked running after one hour, or there has been no successful run within 26 hours
for a deployment with Stripe customers.

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
