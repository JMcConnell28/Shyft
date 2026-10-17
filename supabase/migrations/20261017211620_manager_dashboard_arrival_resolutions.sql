-- Manager-only acknowledgements: no attendance or payable hours are altered.
create table public.dashboard_arrival_resolutions (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  assignment_id uuid references public.rota_published_shift_assignments(id) on delete set null,
  employee_id uuid not null references public.employees(id) on delete cascade,
  shift_key text not null,
  shift_segment text not null check (shift_segment in ('full', 'split_first', 'split_second')),
  scheduled_start_at timestamptz not null,
  reason text not null check (char_length(btrim(reason)) between 5 and 500),
  resolved_by text references public."user"(id) on delete set null,
  resolved_at timestamptz not null default now(),
  unique (location_id, employee_id, shift_key, shift_segment, scheduled_start_at)
);
alter table public.dashboard_arrival_resolutions enable row level security;
revoke all on public.dashboard_arrival_resolutions from anon, authenticated;
grant select, insert on public.dashboard_arrival_resolutions to service_role;
create index dashboard_arrival_resolutions_scope_idx
  on public.dashboard_arrival_resolutions (organization_id, location_id);
create index if not exists time_entries_dashboard_review_idx
  on public.time_entries (location_id, clocked_in_at) where status = 'requires_review';
create index if not exists time_entries_dashboard_open_idx
  on public.time_entries (location_id, clocked_in_at) where clocked_out_at is null;
