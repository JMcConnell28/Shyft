create table if not exists public.organization_onboarding_states (
  organization_id text primary key references public."organization"(id) on delete cascade,
  trial_started_at timestamptz not null default timezone('utc', now()),
  trial_ends_at timestamptz not null,
  last_step text not null default 'location',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.staff_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  name text not null,
  slug text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, slug)
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, slug)
);

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (location_id, name)
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  user_id text references public."user"(id) on delete set null,
  staff_group_id uuid references public.staff_groups(id) on delete set null,
  full_name text not null,
  email text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists employees_org_user_unique_idx
  on public.employees (organization_id, user_id)
  where user_id is not null;

create table if not exists public.employee_location_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  is_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  disabled_at timestamptz,
  unique (employee_id, location_id)
);

create table if not exists public.staff_invite_links (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  default_staff_group_id uuid not null references public.staff_groups(id) on delete cascade,
  default_role text not null default 'employee',
  token text not null unique,
  expires_at timestamptz,
  disabled_at timestamptz,
  created_by text not null references public."user"(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  check (default_role = 'employee')
);

create index if not exists locations_organization_id_idx
  on public.locations (organization_id);

create index if not exists zones_organization_id_idx
  on public.zones (organization_id, location_id);

create index if not exists staff_groups_organization_id_idx
  on public.staff_groups (organization_id);

create index if not exists employee_location_assignments_location_idx
  on public.employee_location_assignments (organization_id, location_id);

create index if not exists staff_invite_links_lookup_idx
  on public.staff_invite_links (organization_id, location_id, disabled_at, expires_at);
