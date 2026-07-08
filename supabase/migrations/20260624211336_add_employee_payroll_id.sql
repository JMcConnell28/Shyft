alter table public.employees
add column if not exists payroll_id text;

alter table public.employees
add constraint employees_payroll_id_not_blank
check (payroll_id is null or length(trim(payroll_id)) > 0);

create unique index if not exists employees_workspace_payroll_id_unique_idx
on public.employees (
  coalesce(organization_id, location_id::text, ''),
  lower(trim(payroll_id))
)
where payroll_id is not null;
