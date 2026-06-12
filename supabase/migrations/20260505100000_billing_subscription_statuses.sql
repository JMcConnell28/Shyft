alter table public.billing_accounts
  drop constraint if exists billing_accounts_status_check;

alter table public.billing_accounts
  add constraint billing_accounts_status_check
  check (
    status in (
      'incomplete',
      'incomplete_expired',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'paused'
    )
  );
