with fallback_groups as (
  select distinct on (location_id)
    id,
    location_id
  from public.staff_groups
  where location_id is not null
    and (is_default = true or slug in ('employee', 'employees'))
  order by location_id, is_default desc, created_at asc
),
created_employees as (
  insert into public.employees (
    organization_id,
    location_id,
    user_id,
    staff_group_id,
    full_name,
    email,
    status
  )
  select
    null,
    lm.location_id,
    lm.user_id,
    fg.id,
    u.name,
    u.email,
    'active'
  from public.location_memberships lm
  join public.locations l on l.id = lm.location_id
  join public."user" u on u.id = lm.user_id
  join fallback_groups fg on fg.location_id = lm.location_id
  where l.organization_id is null
    and lm.role in ('owner', 'admin', 'manager')
  on conflict (location_id, user_id)
  where location_id is not null and user_id is not null
  do update set
    staff_group_id = excluded.staff_group_id,
    full_name = excluded.full_name,
    email = excluded.email,
    status = 'active',
    updated_at = timezone('utc', now())
  returning id, location_id
)
insert into public.employee_location_assignments (
  organization_id,
  employee_id,
  location_id,
  is_enabled
)
select
  null,
  id,
  location_id,
  true
from created_employees
on conflict (employee_id, location_id)
do update set
  is_enabled = true,
  disabled_at = null;
