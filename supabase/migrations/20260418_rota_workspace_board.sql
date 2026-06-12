alter table public.rotas
  add column if not exists has_unpublished_changes boolean not null default false,
  add column if not exists published_snapshot_version integer not null default 0;

create table if not exists public.location_operating_hours (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  close_time time not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (location_id, weekday)
);

create table if not exists public.rota_shifts (
  id uuid primary key default gen_random_uuid(),
  rota_id uuid not null references public.rotas(id) on delete cascade,
  organization_id text not null references public."organization"(id) on delete cascade,
  day_date date not null,
  zone_id uuid not null references public.zones(id) on delete cascade,
  shift_type text not null check (shift_type in ('standard', 'closing', 'split')),
  start_time time not null,
  end_time time,
  end_kind text check (end_kind in ('location_close')),
  split_second_start_time time,
  split_second_end_time time,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (shift_type = 'standard' and end_time is not null and end_kind is null and split_second_start_time is null and split_second_end_time is null)
    or (shift_type = 'closing' and end_time is null and end_kind = 'location_close' and split_second_start_time is null and split_second_end_time is null)
    or (shift_type = 'split' and end_time is not null and end_kind is null and split_second_start_time is not null and split_second_end_time is not null)
  )
);

create table if not exists public.rota_shift_assignments (
  id uuid primary key default gen_random_uuid(),
  rota_shift_id uuid not null references public.rota_shifts(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (rota_shift_id, employee_id)
);

create table if not exists public.rota_published_shifts (
  id uuid primary key default gen_random_uuid(),
  rota_id uuid not null references public.rotas(id) on delete cascade,
  organization_id text not null references public."organization"(id) on delete cascade,
  working_shift_id uuid references public.rota_shifts(id) on delete set null,
  day_date date not null,
  zone_id uuid not null references public.zones(id) on delete cascade,
  shift_type text not null check (shift_type in ('standard', 'closing', 'split')),
  start_time time not null,
  end_time time,
  end_kind text check (end_kind in ('location_close')),
  split_second_start_time time,
  split_second_end_time time,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (shift_type = 'standard' and end_time is not null and end_kind is null and split_second_start_time is null and split_second_end_time is null)
    or (shift_type = 'closing' and end_time is null and end_kind = 'location_close' and split_second_start_time is null and split_second_end_time is null)
    or (shift_type = 'split' and end_time is not null and end_kind is null and split_second_start_time is not null and split_second_end_time is not null)
  )
);

create table if not exists public.rota_published_shift_assignments (
  id uuid primary key default gen_random_uuid(),
  rota_published_shift_id uuid not null references public.rota_published_shifts(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (rota_published_shift_id, employee_id)
);

create index if not exists location_operating_hours_lookup_idx
  on public.location_operating_hours (organization_id, location_id, weekday);

create index if not exists rota_shifts_rota_lookup_idx
  on public.rota_shifts (rota_id, day_date, zone_id, start_time);

create index if not exists rota_shift_assignments_shift_lookup_idx
  on public.rota_shift_assignments (rota_shift_id, employee_id);

create index if not exists rota_published_shifts_rota_lookup_idx
  on public.rota_published_shifts (rota_id, day_date, zone_id, start_time);

create index if not exists rota_published_shift_assignments_shift_lookup_idx
  on public.rota_published_shift_assignments (rota_published_shift_id, employee_id);

insert into public.location_operating_hours (
  organization_id,
  location_id,
  weekday,
  close_time
)
select
  l.organization_id,
  l.id,
  seeded.weekday,
  seeded.close_time
from public.locations l
cross join (
  values
    (1, '23:30'::time),
    (2, '23:00'::time),
    (3, '23:30'::time),
    (4, '23:30'::time),
    (5, '00:30'::time),
    (6, '01:00'::time),
    (7, '22:00'::time)
) as seeded(weekday, close_time)
on conflict (location_id, weekday) do nothing;

alter table public.location_operating_hours enable row level security;
alter table public.rota_shifts enable row level security;
alter table public.rota_shift_assignments enable row level security;
alter table public.rota_published_shifts enable row level security;
alter table public.rota_published_shift_assignments enable row level security;

drop policy if exists "location_operating_hours_select_member" on public.location_operating_hours;
create policy "location_operating_hours_select_member"
on public.location_operating_hours
for select
to public
using (public.is_org_member(organization_id));

drop policy if exists "rota_shifts_select_by_role" on public.rota_shifts;
create policy "rota_shifts_select_by_role"
on public.rota_shifts
for select
to public
using (
  exists (
    select 1
    from public.rotas r
    where r.id = rota_id
      and public.can_read_org_rota(r.organization_id, r.status)
  )
);

drop policy if exists "rota_shift_assignments_select_by_role" on public.rota_shift_assignments;
create policy "rota_shift_assignments_select_by_role"
on public.rota_shift_assignments
for select
to public
using (
  exists (
    select 1
    from public.rota_shifts rs
    join public.rotas r on r.id = rs.rota_id
    where rs.id = rota_shift_id
      and public.can_read_org_rota(r.organization_id, r.status)
  )
);

drop policy if exists "rota_published_shifts_select_by_role" on public.rota_published_shifts;
create policy "rota_published_shifts_select_by_role"
on public.rota_published_shifts
for select
to public
using (
  exists (
    select 1
    from public.rotas r
    where r.id = rota_id
      and public.can_read_org_rota(r.organization_id, 'published')
  )
);

drop policy if exists "rota_published_shift_assignments_select_by_role" on public.rota_published_shift_assignments;
create policy "rota_published_shift_assignments_select_by_role"
on public.rota_published_shift_assignments
for select
to public
using (
  exists (
    select 1
    from public.rota_published_shifts rps
    join public.rotas r on r.id = rps.rota_id
    where rps.id = rota_published_shift_id
      and public.can_read_org_rota(r.organization_id, 'published')
  )
);
