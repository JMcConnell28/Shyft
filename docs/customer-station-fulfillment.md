# Customers and clock-in station fulfilment

The admin **Customers** page includes every organization, even before a location
or billing account is created, plus legacy standalone billing accounts. Search
and stage filters are paginated. Workspaces still provides the location view and
links to each customer.

Each customer record contains their locations, subscription and trial state,
Time & Attendance status, qualifying invoice, delivery address, NFC setup and
internal dispatch tracking. NFC keys and mutations require the existing
`clock_stations.manage` permission; read-only staff never fetch those keys.

## When a station becomes actionable

- The customer has claimed their included hardware and enabled Time & Attendance.
- The trial and add-on billing start have passed.
- Stripe reports a live-mode paid subscription invoice with a positive amount paid and
  Time & Attendance on the subscription. Included T&A employees need no separate
  positive overage line: a positive subscription payment qualifies.
- The invoice was created after activation, the hardware claim and trial end.
  Whole-second Stripe timestamps allow a one-second rounding tolerance.
- The same subscription is currently active, within its paid period, and the
  add-on has not expired or been canceled.
- The station has not already been sent or delivered.

Trial, test-mode, zero-value and failed-payment invoices do not release hardware. An old
payment from before a new location's activation does not release its station.
Each location has one included hardware request; invoice retries and renewals do not create
additional included requests. Extra physical stations are separate one-off orders. Payment evidence is stored separately from subscription
status, in `billing_private.station_payment_receipts`.

## Internal workflow

**Needs setup → Ready to send → Sent → Delivered**. Staff can flag a delivery
problem, add internal notes and save a shipping reference. Marking ready/sent
requires an active NFC tag, complete delivery address and current eligibility.
Status updates lock the hardware record, reject stale status changes and write
an audit record in the same transaction. No dispatch email goes to customers.

The header badge and Clock stations queue refresh every minute. Operator email
defaults to `jackmcconnell99@gmail.com`; `STATION_ALERT_EMAIL` overrides it.
Emails contain customer/location names and an optional admin link, never NFC
keys or the delivery address. `ADMIN_BASE_URL` supplies that link. Existing
Resend configuration is reused; local development keeps the existing test-email
routing.

Each physical station request's alert has a durable sent marker and a five-minute send lease,
claimed in batches of 20 with row locking so concurrent workers skip each other,
with a stable Resend idempotency key. Delivery errors remain pending. An accepted
email followed by a database outage longer than Resend's idempotency window can
still produce a duplicate; exactly-once email delivery is not guaranteed.

## Deployment and recovery

Migration `20261023210435_customer_station_fulfillment.sql` is applied to the
connected hosted database. Apply it to any other databases before deploying.
The new tables/view are private, deny browser-role grants and use RLS; the view
uses invoker security. No existing billing or clocking data was backfilled or
changed by the migration.

Deploy both apps. The main app records `invoice.paid` evidence and sends the
operator alert; the admin app displays the queue and customer records. The main
app's production Nitro task `billing:station-alerts` runs every 15 minutes to
recover qualifying paid invoices for outstanding hardware claims and retry
pending emails. The normal billing reconciliation also recovers invoice
history. These paths read Stripe invoices and never initiate charges.

Keep `RESEND_API_KEY`/`RESEND_FROM_EMAIL` configured in the main app. Optional:
`STATION_ALERT_EMAIL` and `ADMIN_BASE_URL`. No new admin deployment secrets are
required. Ensure Stripe's existing endpoint delivers `invoice.paid`.

Verification uses mocked mail/Stripe services and rollback-only database
fixtures. No real email or hardware request was created during verification.
`supabase/tests/station_fulfillment.sql` must run inside a transaction followed
by **ROLLBACK**, using a development/test database with a location available.

## Additional physical stations

The owner can order one additional station at a time from workspace **Settings →
Billing**, for a location with paid, active Time & Attendance after the trial.
The approved price is **£24.99 once per station**, with no additional recurring
station fee. The existing T&A employee billing continues unchanged. Delivery
uses the existing BT47/BT48 postcode validation. The checkout total is the configured
GBP Price; no separate shipping fee or automatic tax collection was added.

Each purchase has its own immutable order, delivery address, one-time Checkout
Session and internal fulfilment record. A purchase UUID and Stripe idempotency
key prevent retries from creating a second checkout for the same order. An
existing checkout is reused; expired/finished orders require a new purchase.
Payment validation checks the customer, metadata, session, exact Price ID,
quantity, currency and £ amount against the stored order, then verifies the
settled PaymentIntent. The signed webhook handles completed and asynchronous
payment events; the return page never fulfils an order.

Unpaid, failed, expired, refunded, disputed and test-mode orders stay out of the
physical dispatch queue. A positive payment alone cannot bypass the active paid
T&A requirement. If billing ownership changes, the original order is held.
The recovery task also reconciles pending additional-station checkouts. Refund
and dispute events hold unsent hardware; no automatic customer refund or
replacement workflow is introduced. Already dispatched hardware is not recalled.

Admin customer records show included and additional requests separately. Each
request can generate a new NFC tag or assign an existing active location tag.
Tag assignment locks the request and tag, checks both request sources, and
commits the assignment and audit together. A tag cannot fulfil two requests.
Ready/sent transitions require the tag assigned to that particular station.
If a location already had exactly one active tag at migration, it is associated
with the included station; ambiguous locations require explicit assignment.

### Configuration

Set **STRIPE_EXTRA_CLOCK_STATION_PRICE_ID** in the main app only. Local .env.local
now uses sandbox Price **price_1UTqLICoCWijEdroONP796D2**, created in the authorized
RocketRota sandbox (acct_1TS1adCoCWijEdro), £24.99 GBP, one-time, tax-inclusive price
behavior. This setting does not enable tax collection. Restart the local server
when changing environment values. No live product, charge or checkout was created.

Production needs its own live £24.99 one-time GBP Price ID; never use the sandbox
ID with live keys. Ensure the Stripe endpoint includes checkout.session.completed,
checkout.session.async_payment_succeeded, checkout.session.async_payment_failed,
checkout.session.expired, charge.refunded and charge.dispute.created, in addition
to the existing subscription/invoice events. Deploy both apps together after the
migrations. Without a configured price, extra checkout remains unavailable.

Additional applied migrations:
- 20261023214725_extra_clock_station_purchases.sql
- 20261023215044_require_paid_addon_for_extra_stations.sql

Run both supabase/tests/station_fulfillment.sql and
supabase/tests/extra_station_purchases.sql in a single transaction followed by
ROLLBACK. They verify multiple purchases per location, per-request alert
uniqueness, included-station independence, paid T&A gating and private grants.
