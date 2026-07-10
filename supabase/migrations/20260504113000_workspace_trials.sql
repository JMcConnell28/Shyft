create table if not exists public.workspace_trials (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('organization', 'location')),
  organization_id text references public."organization" ("id") on delete cascade,
  location_id uuid references public.locations (id) on delete cascade,
  status text not null default 'trialing' check (status in ('trialing', 'active', 'expired', 'canceled')),
  trial_started_at timestamptz not null default timezone('utc', now()),
  trial_ends_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (scope = 'organization' and organization_id is not null and location_id is null)
    or (scope = 'location' and location_id is not null and organization_id is null)
  )
);

create unique index if not exists workspace_trials_organization_uidx
  on public.workspace_trials (organization_id)
  where organization_id is not null;

create unique index if not exists workspace_trials_location_uidx
  on public.workspace_trials (location_id)
  where location_id is not null;

insert into public.workspace_trials (
  scope,
  organization_id,
  status,
  trial_started_at,
  trial_ends_at
)
select
  'organization',
  organization_id,
  case
    when trial_ends_at <= timezone('utc', now()) then 'expired'
    else 'trialing'
  end,
  trial_started_at,
  trial_ends_at
from public.organization_onboarding_states
on conflict (organization_id)
where organization_id is not null
do nothing;

insert into public.workspace_trials (
  scope,
  location_id,
  status,
  trial_started_at,
  trial_ends_at
)
select
  'location',
  id,
  'trialing',
  timezone('utc', now()),
  timezone('utc', now()) + interval '14 days'
from public.locations
where organization_id is null
on conflict (location_id)
where location_id is not null
do nothing;
