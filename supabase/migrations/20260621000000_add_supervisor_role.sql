do $$
declare
  role_constraint record;
begin
  for role_constraint in
    select conname
    from pg_constraint
    where conrelid = 'public.location_memberships'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%role%'
  loop
    execute format(
      'alter table public.location_memberships drop constraint %I',
      role_constraint.conname
    );
  end loop;
end $$;

alter table public.location_memberships
  add constraint location_memberships_role_check
  check (role in ('owner', 'admin', 'manager', 'supervisor', 'employee'));

create or replace function public.can_read_org_rota(
  target_organization_id text,
  rota_status text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_org_role(target_organization_id, array['owner', 'admin', 'manager', 'supervisor'])
    or (
      public.has_org_role(target_organization_id, array['employee', 'member'])
      and rota_status = 'published'
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
    public.has_location_role(target_location_id, array['owner', 'admin', 'manager', 'supervisor'])
    or (
      public.has_location_role(target_location_id, array['employee'])
      and rota_status = 'published'
    )
$$;

drop policy if exists "clock_tags_select_manager" on public.clock_tags;
create policy "clock_tags_select_manager"
on public.clock_tags
for select
to public
using (
  public.has_location_role(location_id, array['owner', 'admin', 'manager', 'supervisor'])
);

drop policy if exists "time_entries_select_self_or_manager" on public.time_entries;
create policy "time_entries_select_self_or_manager"
on public.time_entries
for select
to public
using (
  public.has_location_role(location_id, array['owner', 'admin', 'manager', 'supervisor'])
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
  public.has_location_role(location_id, array['owner', 'admin', 'manager', 'supervisor'])
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
  and public.has_location_role(location_id, array['owner', 'admin', 'manager', 'supervisor'])
);
