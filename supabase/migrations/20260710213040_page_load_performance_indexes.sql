-- High-frequency authorization lookup used by every organization workspace page.
create index if not exists member_organization_user_idx
  on public."member" ("organizationId", "userId");

-- Dashboard/timesheet lookups start from the current user's employees and then
-- narrow to enabled location assignments.
create index if not exists employee_location_assignments_active_employee_idx
  on public.employee_location_assignments (employee_id, location_id)
  where is_enabled = true and disabled_at is null;

create index if not exists employees_active_user_idx
  on public.employees (user_id)
  where user_id is not null and status = 'active';

-- Dashboard shift queries filter assignments by employee before joining to the
-- published shift and rota date range.
create index if not exists rota_published_assignments_employee_idx
  on public.rota_published_shift_assignments (
    employee_id,
    rota_published_shift_id
  );

create index if not exists rota_shift_assignments_employee_idx
  on public.rota_shift_assignments (employee_id, rota_shift_id);
