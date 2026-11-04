create table billing_private.payment_risk_reviews (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null,
  risk_type text not null check (risk_type in ('refund', 'dispute', 'fraud_warning')),
  billing_account_id uuid references public.billing_accounts(id),
  stripe_subscription_id text,
  stripe_charge_id text not null,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  amount integer not null check (amount >= 0),
  amount_refunded integer not null check (amount_refunded >= 0),
  currency text not null,
  livemode boolean not null,
  event_created_at timestamptz not null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text references admin_private.admin_user(id),
  review_reason text,
  unique nulls not distinct (stripe_event_id, stripe_subscription_id)
);
create index payment_risk_reviews_open_idx on billing_private.payment_risk_reviews (created_at) where reviewed_at is null;
alter table billing_private.payment_risk_reviews enable row level security;
revoke all on billing_private.payment_risk_reviews from public, anon, authenticated;
grant usage on schema billing_private to service_role;
grant select, insert, update, delete on billing_private.payment_risk_reviews to service_role;
create policy payment_risk_reviews_server_access on billing_private.payment_risk_reviews for all to service_role using (true) with check (true);
