create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  api_version text,
  livemode boolean not null default false,
  processing_status text not null default 'received' check (
    processing_status in ('received', 'processed', 'failed')
  ),
  billing_account_id uuid references public.billing_accounts(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text,
  error_message text,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists stripe_webhook_events_status_idx
  on public.stripe_webhook_events (processing_status, received_at desc);

create index if not exists stripe_webhook_events_billing_account_idx
  on public.stripe_webhook_events (billing_account_id, received_at desc)
  where billing_account_id is not null;

alter table public.stripe_webhook_events enable row level security;
