create or replace function public.request_header(header_name text)
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.headers', true), '')::jsonb ->> lower(header_name),
    nullif(current_setting('request.headers', true), '')::jsonb ->> header_name
  )
$$;

create or replace function public.request_cookie(cookie_name text)
returns text
language sql
stable
as $$
  select (
    regexp_match(
      coalesce(public.request_header('cookie'), ''),
      '(?:^|;\s*)' ||
        regexp_replace(cookie_name, '([.[\]()*+?^$|\\-])', '\\\1', 'g') ||
        '=([^;]+)'
    )
  )[1]
$$;

create or replace function public.current_better_auth_session_token()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(public.request_header('x-shyft-session-token'), ''),
    nullif(regexp_replace(public.request_header('authorization'), '^Bearer\s+', '', 'i'), ''),
    public.request_cookie('__Secure-better-auth.session_token'),
    public.request_cookie('better-auth.session_token')
  )
$$;

create or replace function public.current_better_auth_user_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select s."userId"
  from public."session" s
  where s.token = public.current_better_auth_session_token()
    and s."expiresAt" > timezone('utc', now())
  order by s."expiresAt" desc
  limit 1
$$;

create or replace function public.current_better_auth_email()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.email
  from public."user" u
  where u.id = public.current_better_auth_user_id()
  limit 1
$$;

create or replace function public.is_org_member(target_organization_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.member m
    where m."organizationId" = target_organization_id
      and m."userId" = public.current_better_auth_user_id()
  )
$$;

create or replace function public.has_org_role(
  target_organization_id text,
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
    from public.member m
    where m."organizationId" = target_organization_id
      and m."userId" = public.current_better_auth_user_id()
      and m.role = any(allowed_roles)
  )
$$;

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
    public.has_org_role(target_organization_id, array['owner', 'admin', 'manager'])
    or (
      public.has_org_role(target_organization_id, array['employee', 'member'])
      and rota_status = 'published'
    )
$$;

drop policy if exists "user_select_self_or_shared_org" on public."user";
drop policy if exists "user_update_self" on public."user";
create policy "user_select_self_or_shared_org"
on public."user"
for select
to public
using (
  id = public.current_better_auth_user_id()
  or exists (
    select 1
    from public.member self_member
    join public.member target_member
      on target_member."organizationId" = self_member."organizationId"
    where self_member."userId" = public.current_better_auth_user_id()
      and target_member."userId" = public."user".id
  )
);

drop policy if exists "organization_select_member" on public."organization";
drop policy if exists "organization_update_admin" on public."organization";
create policy "organization_select_member"
on public."organization"
for select
to public
using (public.is_org_member(id));

drop policy if exists "member_select_org_member" on public.member;
drop policy if exists "member_manage_admin" on public.member;
create policy "member_select_org_member"
on public.member
for select
to public
using (public.is_org_member("organizationId"));

drop policy if exists "invitation_select_admin_or_invitee" on public.invitation;
drop policy if exists "invitation_manage_admin" on public.invitation;
create policy "invitation_select_admin_or_invitee"
on public.invitation
for select
to public
using (
  public.has_org_role("organizationId", array['owner', 'admin'])
  or lower(email) = lower(public.current_better_auth_email())
);

drop policy if exists "onboarding_state_select_member" on public.organization_onboarding_states;
drop policy if exists "onboarding_state_manage_admin" on public.organization_onboarding_states;
create policy "onboarding_state_select_member"
on public.organization_onboarding_states
for select
to public
using (public.is_org_member(organization_id));

drop policy if exists "staff_groups_select_member" on public.staff_groups;
drop policy if exists "staff_groups_manage_admin" on public.staff_groups;
create policy "staff_groups_select_member"
on public.staff_groups
for select
to public
using (public.is_org_member(organization_id));

drop policy if exists "locations_select_member" on public.locations;
drop policy if exists "locations_manage_admin" on public.locations;
create policy "locations_select_member"
on public.locations
for select
to public
using (public.is_org_member(organization_id));

drop policy if exists "zones_select_member" on public.zones;
drop policy if exists "zones_manage_admin" on public.zones;
create policy "zones_select_member"
on public.zones
for select
to public
using (public.is_org_member(organization_id));

drop policy if exists "employees_select_member" on public.employees;
drop policy if exists "employees_manage_admin_or_self" on public.employees;
create policy "employees_select_member"
on public.employees
for select
to public
using (public.is_org_member(organization_id));

drop policy if exists "employee_location_assignments_select_member" on public.employee_location_assignments;
drop policy if exists "employee_location_assignments_manage_admin_or_self" on public.employee_location_assignments;
create policy "employee_location_assignments_select_member"
on public.employee_location_assignments
for select
to public
using (public.is_org_member(organization_id));

drop policy if exists "staff_invite_links_select_admin" on public.staff_invite_links;
drop policy if exists "staff_invite_links_manage_admin" on public.staff_invite_links;
create policy "staff_invite_links_select_admin"
on public.staff_invite_links
for select
to public
using (public.has_org_role(organization_id, array['owner', 'admin']));

drop policy if exists "rota_templates_select_member" on public.rota_templates;
drop policy if exists "rota_templates_manage_manager" on public.rota_templates;
create policy "rota_templates_select_member"
on public.rota_templates
for select
to public
using (public.is_org_member(organization_id));

drop policy if exists "rotas_select_by_role" on public.rotas;
drop policy if exists "rotas_manage_manager" on public.rotas;
create policy "rotas_select_by_role"
on public.rotas
for select
to public
using (public.can_read_org_rota(organization_id, status));

drop policy if exists "rota_reads_select_own" on public.rota_reads;
drop policy if exists "rota_reads_manage_own_for_accessible_rota" on public.rota_reads;
create policy "rota_reads_select_own"
on public.rota_reads
for select
to public
using (user_id = public.current_better_auth_user_id());
