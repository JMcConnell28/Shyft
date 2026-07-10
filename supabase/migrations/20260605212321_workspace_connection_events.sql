create table if not exists public.workspace_connection_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in ('location_organization_move', 'location_billing_move')
  ),
  location_id uuid not null references public.locations(id) on delete cascade,
  source_organization_id text references public."organization"(id) on delete set null,
  target_organization_id text references public."organization"(id) on delete set null,
  source_billing_account_id uuid references public.billing_accounts(id) on delete set null,
  target_billing_account_id uuid references public.billing_accounts(id) on delete set null,
  actor_user_id text references public."user"(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists workspace_connection_events_location_idx
  on public.workspace_connection_events (location_id, created_at desc);

create index if not exists workspace_connection_events_actor_idx
  on public.workspace_connection_events (actor_user_id, created_at desc)
  where actor_user_id is not null;

alter table public.workspace_connection_events enable row level security;
