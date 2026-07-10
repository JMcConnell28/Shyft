create table if not exists public.location_clock_settings (
  location_id uuid primary key references public.locations(id) on delete cascade,
  organization_id text references public."organization"(id) on delete cascade,
  is_enabled boolean not null default false,
  latitude double precision,
  longitude double precision,
  radius_meters integer not null default 75 check (radius_meters between 10 and 1000),
  max_accuracy_meters integer not null default 150 check (max_accuracy_meters between 10 and 1000),
  timezone text not null default 'Europe/London',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (latitude is null and longitude is null)
    or (
      latitude between -90 and 90
      and longitude between -180 and 180
    )
  )
);

create table if not exists public.clock_tags (
  id uuid primary key default gen_random_uuid(),
  organization_id text references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  label text not null,
  token_hash text not null unique,
  is_active boolean not null default true,
  disabled_at timestamptz,
  created_by text references public."user"(id) on delete set null,
  rotated_by text references public."user"(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (char_length(trim(label)) between 2 and 60),
  check (
    (is_active = true and disabled_at is null)
    or is_active = false
  )
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id text references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  user_id text references public."user"(id) on delete set null,
  rota_published_shift_id uuid references public.rota_published_shifts(id) on delete set null,
  clocked_in_at timestamptz not null default timezone('utc', now()),
  clocked_out_at timestamptz,
  status text not null default 'open' check (status in ('open', 'closed', 'requires_review')),
  source text not null check (source in ('employee_nfc', 'manager_override', 'adjustment')),
  notes text,
  created_by text references public."user"(id) on delete set null,
  updated_by text references public."user"(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (clocked_out_at is null or clocked_out_at >= clocked_in_at)
);

create table if not exists public.clock_events (
  id uuid primary key default gen_random_uuid(),
  time_entry_id uuid references public.time_entries(id) on delete cascade,
  organization_id text references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  performed_by_user_id text references public."user"(id) on delete set null,
  event_type text not null check (
    event_type in (
      'clock_in',
      'clock_out',
      'manager_clock_in',
      'manager_clock_out',
      'manager_adjustment'
    )
  ),
  event_at timestamptz not null default timezone('utc', now()),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clock_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id text references public."organization"(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  clock_tag_id uuid references public.clock_tags(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,
  performed_by_user_id text references public."user"(id) on delete set null,
  action text check (action in ('clock_in', 'clock_out')),
  success boolean not null,
  failure_reason text,
  gps_latitude double precision,
  gps_longitude double precision,
  gps_accuracy_meters double precision,
  gps_distance_meters double precision,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists clock_tags_location_lookup_idx
  on public.clock_tags (location_id, is_active);

create index if not exists time_entries_location_lookup_idx
  on public.time_entries (location_id, clocked_in_at desc);

create index if not exists time_entries_employee_lookup_idx
  on public.time_entries (employee_id, clocked_in_at desc);

create unique index if not exists time_entries_one_open_per_employee_location_idx
  on public.time_entries (employee_id, location_id)
  where clocked_out_at is null;

create index if not exists clock_events_time_entry_lookup_idx
  on public.clock_events (time_entry_id, created_at asc);

create index if not exists clock_events_location_lookup_idx
  on public.clock_events (location_id, created_at desc);

create index if not exists clock_attempts_location_lookup_idx
  on public.clock_attempts (location_id, created_at desc);

alter table public.location_clock_settings enable row level security;
alter table public.clock_tags enable row level security;
alter table public.time_entries enable row level security;
alter table public.clock_events enable row level security;
alter table public.clock_attempts enable row level security;

drop policy if exists "location_clock_settings_select_location_member" on public.location_clock_settings;
create policy "location_clock_settings_select_location_member"
on public.location_clock_settings
for select
to public
using (public.is_location_member(location_id));

drop policy if exists "clock_tags_select_manager" on public.clock_tags;
create policy "clock_tags_select_manager"
on public.clock_tags
for select
to public
using (public.has_location_role(location_id, array['owner', 'admin', 'manager']));

drop policy if exists "time_entries_select_self_or_manager" on public.time_entries;
create policy "time_entries_select_self_or_manager"
on public.time_entries
for select
to public
using (
  public.has_location_role(location_id, array['owner', 'admin', 'manager'])
  or exists (
    select 1
    from public.employees employee
    where employee.id = time_entries.employee_id
      and employee.user_id = public.current_better_auth_user_id()
  )
);

drop policy if exists "clock_events_select_self_or_manager" on public.clock_events;
create policy "clock_events_select_self_or_manager"
on public.clock_events
for select
to public
using (
  public.has_location_role(location_id, array['owner', 'admin', 'manager'])
  or exists (
    select 1
    from public.employees employee
    where employee.id = clock_events.employee_id
      and employee.user_id = public.current_better_auth_user_id()
  )
);

drop policy if exists "clock_attempts_select_manager" on public.clock_attempts;
create policy "clock_attempts_select_manager"
on public.clock_attempts
for select
to public
using (
  location_id is not null
  and public.has_location_role(location_id, array['owner', 'admin', 'manager'])
);
