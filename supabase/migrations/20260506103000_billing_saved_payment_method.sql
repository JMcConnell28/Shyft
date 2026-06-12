alter table public.billing_accounts
  add column if not exists stripe_payment_method_id text,
  add column if not exists payment_method_saved_at timestamptz;

alter table public.billing_accounts
  drop constraint if exists billing_accounts_status_check;

alter table public.billing_accounts
  add constraint billing_accounts_status_check
  check (
    status in (
      'incomplete',
      'payment_method_saved',
      'incomplete_expired',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'paused'
    )
  );
