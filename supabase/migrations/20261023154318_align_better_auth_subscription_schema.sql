-- Better Auth Stripe 1.7 reads these optional fields. Nullable additions preserve
-- existing subscriptions and remain compatible with the previous release.
alter table public.subscription
  add column if not exists "billingInterval" text,
  add column if not exists "stripeScheduleId" text;

notify pgrst, 'reload schema';
