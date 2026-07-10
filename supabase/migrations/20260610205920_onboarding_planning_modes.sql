alter table public.locations
  add column if not exists business_type text not null default 'hospitality'
    check (
      business_type in (
        'hospitality',
        'retail',
        'salon_clinic_venue',
        'cleaning',
        'security',
        'mobile_events_contracts'
      )
    ),
  add column if not exists planning_mode text not null default 'fixed_location'
    check (planning_mode in ('fixed_location', 'variable_location'));

create table if not exists public.worksites (
  id uuid primary key default gen_random_uuid(),
  organization_id text references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (length(btrim(name)) between 2 and 80)
);

create index if not exists worksites_location_sort_idx
  on public.worksites (location_id, sort_order, name);

create unique index if not exists worksites_location_name_uidx
  on public.worksites (location_id, lower(name));

alter table public.worksites enable row level security;

drop policy if exists "worksites_select_member" on public.worksites;
create policy "worksites_select_member"
on public.worksites
for select
to public
using (
  (organization_id is not null and public.is_org_member(organization_id))
  or public.is_location_member(location_id)
);

drop policy if exists "worksites_manage_admin" on public.worksites;
create policy "worksites_manage_admin"
on public.worksites
for all
to public
using (
  (organization_id is not null and public.has_org_role(organization_id, array['owner', 'admin', 'manager']))
  or public.has_location_role(location_id, array['owner', 'admin', 'manager'])
)
with check (
  (organization_id is not null and public.has_org_role(organization_id, array['owner', 'admin', 'manager']))
  or public.has_location_role(location_id, array['owner', 'admin', 'manager'])
);
