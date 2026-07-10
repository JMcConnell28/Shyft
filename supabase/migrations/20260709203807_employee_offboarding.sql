alter table public.employees
  add column if not exists offboarded_at timestamptz;

create index if not exists employees_organization_offboarded_lookup_idx
  on public.employees (organization_id, offboarded_at, full_name)
  where organization_id is not null;
