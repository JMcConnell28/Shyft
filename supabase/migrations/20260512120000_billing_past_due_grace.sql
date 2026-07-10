alter table public.billing_subscriptions
  add column if not exists past_due_started_at timestamptz;

update public.billing_subscriptions
set past_due_started_at = coalesce(past_due_started_at, updated_at, timezone('utc', now()))
where status = 'past_due'
  and past_due_started_at is null;

create index if not exists billing_subscriptions_past_due_started_idx
  on public.billing_subscriptions (past_due_started_at)
  where status = 'past_due';
