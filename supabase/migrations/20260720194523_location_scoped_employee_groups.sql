alter table public.employee_location_assignments
  add column if not exists staff_group_id uuid
  references public.staff_groups(id) on delete set null;

update public.employee_location_assignments assignment
set staff_group_id = employee.staff_group_id
from public.employees employee
join public.staff_groups staff_group
  on staff_group.id = employee.staff_group_id
where assignment.employee_id = employee.id
  and assignment.staff_group_id is null
  and (
    (
      assignment.organization_id is not null
      and staff_group.organization_id = assignment.organization_id
    )
    or (
      assignment.organization_id is null
      and staff_group.organization_id is null
      and staff_group.location_id = assignment.location_id
    )
  );

create index if not exists employee_location_assignments_staff_group_idx
  on public.employee_location_assignments (staff_group_id)
  where staff_group_id is not null;

comment on column public.employee_location_assignments.staff_group_id is
  'The employee staff group used at this location.';
