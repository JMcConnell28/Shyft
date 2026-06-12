create table if not exists public.workspace_welcome_dismissals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  organization_id text references public."organization"(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  dismissed_at timestamptz not null default timezone('utc', now()),
  constraint workspace_welcome_dismissals_single_scope_check
    check ((organization_id is not null) <> (location_id is not null))
);

create unique index if not exists workspace_welcome_dismissals_user_org_uidx
  on public.workspace_welcome_dismissals (user_id, organization_id)
  where organization_id is not null;

create unique index if not exists workspace_welcome_dismissals_user_location_uidx
  on public.workspace_welcome_dismissals (user_id, location_id)
  where location_id is not null;

alter table public.workspace_welcome_dismissals enable row level security;

revoke all on table public.workspace_welcome_dismissals from anon, authenticated;
