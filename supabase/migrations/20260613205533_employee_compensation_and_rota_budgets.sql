create table if not exists public.employee_compensation (
  employee_id uuid primary key references public.employees(id) on delete cascade,
  organization_id text references public."organization"(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  pay_type text not null default 'hourly'
    check (pay_type in ('hourly', 'salary')),
  hourly_rate_pence integer,
  weekly_salary_pence integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint employee_compensation_scope_check
    check ((organization_id is not null) <> (location_id is not null)),
  constraint employee_compensation_amount_check
    check (
      (pay_type = 'hourly'
        and hourly_rate_pence is not null
        and hourly_rate_pence >= 0
        and weekly_salary_pence is null)
      or
      (pay_type = 'salary'
        and weekly_salary_pence is not null
        and weekly_salary_pence >= 0
        and hourly_rate_pence is null)
    )
);

insert into public.employee_compensation (
  employee_id,
  organization_id,
  location_id,
  pay_type,
  hourly_rate_pence
)
select id, organization_id, location_id, 'hourly', 1271
from public.employees
on conflict (employee_id) do nothing;

create index if not exists employee_compensation_organization_idx
  on public.employee_compensation (organization_id, employee_id)
  where organization_id is not null;

create index if not exists employee_compensation_location_idx
  on public.employee_compensation (location_id, employee_id)
  where location_id is not null;

alter table public.employee_compensation enable row level security;

drop policy if exists "employee_compensation_select_manager" on public.employee_compensation;
create policy "employee_compensation_select_manager"
on public.employee_compensation
for select
to public
using (
  (organization_id is not null
    and public.has_org_role(organization_id, array['owner', 'admin', 'manager']))
  or
  (location_id is not null
    and public.has_location_role(location_id, array['owner', 'admin', 'manager']))
);

create table if not exists public.rota_budgets (
  rota_id uuid primary key references public.rotas(id) on delete cascade,
  organization_id text references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  budget_pence integer not null check (budget_pence >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists rota_budgets_organization_idx
  on public.rota_budgets (organization_id, rota_id)
  where organization_id is not null;

create index if not exists rota_budgets_location_idx
  on public.rota_budgets (location_id, rota_id);

alter table public.rota_budgets enable row level security;

drop policy if exists "rota_budgets_select_manager" on public.rota_budgets;
create policy "rota_budgets_select_manager"
on public.rota_budgets
for select
to public
using (
  (organization_id is not null
    and public.has_org_role(organization_id, array['owner', 'admin', 'manager']))
  or
  (organization_id is null
    and public.has_location_role(location_id, array['owner', 'admin', 'manager']))
);
