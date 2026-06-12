create table if not exists public.billing_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running' check (
    status in ('running', 'completed', 'failed')
  ),
  checked_account_count integer not null default 0 check (checked_account_count >= 0),
  synced_subscription_count integer not null default 0 check (synced_subscription_count >= 0),
  synced_quantity_count integer not null default 0 check (synced_quantity_count >= 0),
  failed_account_count integer not null default 0 check (failed_account_count >= 0),
  error_message text,
  started_at timestamptz not null default timezone('utc', now()),
  finished_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists billing_reconciliation_runs_started_at_idx
  on public.billing_reconciliation_runs (started_at desc);

alter table public.billing_reconciliation_runs enable row level security;
