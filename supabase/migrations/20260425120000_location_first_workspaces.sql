alter table public.locations
  alter column organization_id drop not null;

alter table public.zones
  alter column organization_id drop not null;

alter table public.staff_groups
  alter column organization_id drop not null,
  add column if not exists location_id uuid references public.locations(id) on delete cascade;

alter table public.employees
  alter column organization_id drop not null,
  add column if not exists location_id uuid references public.locations(id) on delete cascade;

alter table public.employee_location_assignments
  alter column organization_id drop not null;

alter table public.staff_invite_links
  alter column organization_id drop not null;

alter table public.rota_templates
  alter column organization_id drop not null;

alter table public.rotas
  alter column organization_id drop not null;

alter table public.location_operating_hours
  alter column organization_id drop not null;

create table if not exists public.location_memberships (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  user_id text not null references public."user"(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'manager', 'employee')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (location_id, user_id)
);

create index if not exists location_memberships_user_id_idx
  on public.location_memberships (user_id);

create unique index if not exists locations_standalone_slug_uidx
  on public.locations (slug)
  where organization_id is null;

create unique index if not exists staff_groups_location_slug_uidx
  on public.staff_groups (location_id, slug)
  where location_id is not null;

create unique index if not exists employees_location_user_unique_idx
  on public.employees (location_id, user_id)
  where location_id is not null and user_id is not null;

create or replace function public.is_location_member(target_location_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.location_memberships lm
    where lm.location_id = target_location_id
      and lm.user_id = public.current_better_auth_user_id()
  )
  or exists (
    select 1
    from public.locations l
    where l.id = target_location_id
      and l.organization_id is not null
      and public.is_org_member(l.organization_id)
  )
$$;

create or replace function public.has_location_role(
  target_location_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.location_memberships lm
    where lm.location_id = target_location_id
      and lm.user_id = public.current_better_auth_user_id()
      and lm.role = any(allowed_roles)
  )
  or exists (
    select 1
    from public.locations l
    where l.id = target_location_id
      and l.organization_id is not null
      and public.has_org_role(l.organization_id, allowed_roles)
  )
$$;

create or replace function public.can_read_location_rota(
  target_location_id uuid,
  rota_status text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_location_role(target_location_id, array['owner', 'admin', 'manager'])
    or (
      public.has_location_role(target_location_id, array['employee'])
      and rota_status = 'published'
    )
$$;

drop policy if exists "location_memberships_select_location_member" on public.location_memberships;
create policy "location_memberships_select_location_member"
on public.location_memberships
for select
to public
using (public.is_location_member(location_id));

drop policy if exists "locations_select_member" on public.locations;
create policy "locations_select_member"
on public.locations
for select
to public
using (
  (organization_id is not null and public.is_org_member(organization_id))
  or public.is_location_member(id)
);

drop policy if exists "zones_select_member" on public.zones;
create policy "zones_select_member"
on public.zones
for select
to public
using (
  (organization_id is not null and public.is_org_member(organization_id))
  or public.is_location_member(location_id)
);

drop policy if exists "staff_groups_select_member" on public.staff_groups;
create policy "staff_groups_select_member"
on public.staff_groups
for select
to public
using (
  (organization_id is not null and public.is_org_member(organization_id))
  or (location_id is not null and public.is_location_member(location_id))
);

drop policy if exists "employees_select_member" on public.employees;
create policy "employees_select_member"
on public.employees
for select
to public
using (
  (organization_id is not null and public.is_org_member(organization_id))
  or (location_id is not null and public.is_location_member(location_id))
);

drop policy if exists "employee_location_assignments_select_member" on public.employee_location_assignments;
create policy "employee_location_assignments_select_member"
on public.employee_location_assignments
for select
to public
using (public.is_location_member(location_id));

drop policy if exists "staff_invite_links_select_admin" on public.staff_invite_links;
create policy "staff_invite_links_select_admin"
on public.staff_invite_links
for select
to public
using (
  (organization_id is not null and public.has_org_role(organization_id, array['owner', 'admin']))
  or public.has_location_role(location_id, array['owner', 'admin'])
);

drop policy if exists "rota_templates_select_member" on public.rota_templates;
create policy "rota_templates_select_member"
on public.rota_templates
for select
to public
using (
  (organization_id is not null and public.is_org_member(organization_id))
  or (location_id is not null and public.is_location_member(location_id))
);

drop policy if exists "rotas_select_by_role" on public.rotas;
create policy "rotas_select_by_role"
on public.rotas
for select
to public
using (
  (organization_id is not null and public.can_read_org_rota(organization_id, status))
  or public.can_read_location_rota(location_id, status)
);
