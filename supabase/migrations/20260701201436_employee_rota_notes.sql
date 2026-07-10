create table if not exists public.employee_rota_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"("id") on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  zone_id uuid references public.zones(id) on delete set null,
  category text not null default 'general' check (
    category in ('general', 'skill', 'constraint', 'preference', 'warning')
  ),
  title text not null check (char_length(trim(title)) between 2 and 80),
  body text not null check (char_length(trim(body)) between 1 and 1000),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  is_pinned boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_by_user_id text references public."user"(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  check (
    (status = 'archived' and archived_at is not null)
    or (status = 'active' and archived_at is null)
  )
);

create index if not exists employee_rota_notes_employee_active_idx
  on public.employee_rota_notes (
    employee_id,
    is_pinned desc,
    priority,
    updated_at desc
  )
  where status = 'active';

create index if not exists employee_rota_notes_org_status_idx
  on public.employee_rota_notes (organization_id, status, updated_at desc);

create index if not exists employee_rota_notes_location_idx
  on public.employee_rota_notes (location_id)
  where location_id is not null and status = 'active';

create index if not exists employee_rota_notes_zone_idx
  on public.employee_rota_notes (zone_id)
  where zone_id is not null and status = 'active';

alter table public.employee_rota_notes enable row level security;

drop policy if exists "employee_rota_notes_select_managers"
  on public.employee_rota_notes;
create policy "employee_rota_notes_select_managers"
on public.employee_rota_notes
for select
to public
using (
  public.has_org_role(organization_id, array['owner', 'admin', 'manager', 'supervisor'])
  or (
    location_id is not null
    and public.has_location_role(location_id, array['owner', 'admin', 'manager', 'supervisor'])
  )
);

drop policy if exists "employee_rota_notes_insert_server_only"
  on public.employee_rota_notes;
create policy "employee_rota_notes_insert_server_only"
on public.employee_rota_notes
for insert
to public
with check (false);

drop policy if exists "employee_rota_notes_update_server_only"
  on public.employee_rota_notes;
create policy "employee_rota_notes_update_server_only"
on public.employee_rota_notes
for update
to public
using (false)
with check (false);

drop policy if exists "employee_rota_notes_delete_server_only"
  on public.employee_rota_notes;
create policy "employee_rota_notes_delete_server_only"
on public.employee_rota_notes
for delete
to public
using (false);
