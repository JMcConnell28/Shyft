create schema if not exists billing_private;

revoke all on schema billing_private from public, anon, authenticated;

alter table public.billing_accounts
  add column if not exists stripe_tax_exempt text,
  add column if not exists stripe_tax_id_count integer not null default 0,
  add column if not exists billing_address_country text;

create table if not exists billing_private.billing_account_administrators (
  billing_account_id uuid not null references public.billing_accounts(id) on delete cascade,
  user_id text not null references public."user"(id) on delete cascade,
  role text not null default 'administrator' check (role in ('owner', 'administrator')),
  created_at timestamptz not null default timezone('utc', now()),
  created_by_user_id text references public."user"(id) on delete set null,
  primary key (billing_account_id, user_id)
);

create table if not exists billing_private.billing_subscription_items (
  id uuid primary key default gen_random_uuid(),
  billing_subscription_id uuid not null references public.billing_subscriptions(id) on delete cascade,
  stripe_subscription_item_id text not null unique,
  stripe_price_id text not null,
  item_type text not null check (item_type in ('location', 'time_attendance', 'employee_overage', 'legacy')),
  quantity integer check (quantity is null or quantity >= 0),
  is_metered boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table billing_private.billing_subscription_items
  drop constraint if exists billing_subscription_items_billing_subscription_id_item_type_key;

create unique index if not exists billing_subscription_items_type_uidx
  on billing_private.billing_subscription_items (billing_subscription_id, item_type)
  where item_type <> 'legacy';

create table if not exists billing_private.location_entitlements (
  location_id uuid primary key references public.locations(id) on delete cascade,
  trial_started_at timestamptz not null,
  trial_ends_at timestamptz not null,
  trial_consumed_at timestamptz not null,
  recovery_started_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (trial_ends_at > trial_started_at)
);

create table if not exists billing_private.location_billing_periods (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  billing_account_id uuid not null references public.billing_accounts(id) on delete restrict,
  stripe_subscription_id text,
  period_start timestamptz not null,
  period_end timestamptz not null,
  included_employee_count integer not null default 10 check (included_employee_count >= 0),
  high_water_employee_count integer not null default 0 check (high_water_employee_count >= 0),
  finalized_employee_count integer check (finalized_employee_count is null or finalized_employee_count >= 0),
  finalized_overage_count integer check (finalized_overage_count is null or finalized_overage_count >= 0),
  finalized_at timestamptz,
  last_observed_at timestamptz,
  last_meter_value integer not null default 0 check (last_meter_value >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (period_end > period_start),
  unique (location_id, period_start, period_end)
);

create index if not exists location_billing_periods_account_period_idx
  on billing_private.location_billing_periods (billing_account_id, period_start, period_end);

create index if not exists location_billing_periods_open_idx
  on billing_private.location_billing_periods (period_end)
  where finalized_at is null;

create table if not exists billing_private.location_billing_usage_snapshots (
  id bigint generated always as identity primary key,
  location_billing_period_id uuid not null references billing_private.location_billing_periods(id) on delete cascade,
  observed_employee_count integer not null check (observed_employee_count >= 0),
  high_water_employee_count integer not null check (high_water_employee_count >= 0),
  source text not null check (source in ('status_change', 'location_assignment', 'published_rota', 'reconciliation', 'period_finalization', 'backfill')),
  observed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists location_usage_snapshots_period_idx
  on billing_private.location_billing_usage_snapshots (location_billing_period_id, observed_at desc);

create table if not exists billing_private.location_addons (
  location_id uuid not null references public.locations(id) on delete cascade,
  addon_type text not null check (addon_type in ('time_attendance')),
  status text not null check (status in ('legacy_pending', 'trialing', 'active', 'canceling', 'canceled')),
  activated_at timestamptz,
  billing_starts_at timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  legacy_opt_in_deadline timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (location_id, addon_type)
);

create table if not exists billing_private.location_hardware_entitlements (
  location_id uuid primary key references public.locations(id) on delete cascade,
  addon_type text not null default 'time_attendance' check (addon_type = 'time_attendance'),
  entitlement_status text not null default 'available' check (entitlement_status in ('available', 'claimed', 'void')),
  fulfillment_status text not null default 'not_requested' check (fulfillment_status in ('not_requested', 'pending', 'shipped', 'delivered', 'failed')),
  claimed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  stripe_payment_method_required boolean not null default true,
  delivery_country text check (delivery_country is null or delivery_country = 'GB'),
  delivery_name text,
  delivery_line1 text,
  delivery_line2 text,
  delivery_city text,
  delivery_county text,
  delivery_postcode text,
  fulfillment_reference text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table billing_private.location_hardware_entitlements
  add column if not exists delivery_name text,
  add column if not exists delivery_line1 text,
  add column if not exists delivery_line2 text,
  add column if not exists delivery_city text,
  add column if not exists delivery_county text,
  add column if not exists delivery_postcode text;

create table if not exists billing_private.billing_transfers (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  source_billing_account_id uuid not null references public.billing_accounts(id) on delete restrict,
  target_billing_account_id uuid not null references public.billing_accounts(id) on delete restrict,
  status text not null default 'scheduled' check (status in ('scheduled', 'ready', 'completed', 'failed', 'canceled')),
  effective_at timestamptz not null,
  requested_by_user_id text references public."user"(id) on delete set null,
  completed_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (source_billing_account_id <> target_billing_account_id)
);

create unique index if not exists billing_transfers_one_pending_per_location_uidx
  on billing_private.billing_transfers (location_id)
  where status in ('scheduled', 'ready');

insert into billing_private.billing_account_administrators (
  billing_account_id,
  user_id,
  role,
  created_by_user_id
)
select id, owner_user_id, 'owner', owner_user_id
from public.billing_accounts
where owner_user_id is not null
on conflict (billing_account_id, user_id) do nothing;

insert into billing_private.billing_account_administrators (
  billing_account_id,
  user_id,
  role,
  created_by_user_id
)
select distinct on (location.billing_account_id)
  location.billing_account_id,
  membership.user_id,
  'owner',
  membership.user_id
from public.locations location
join public.location_memberships membership on membership.location_id = location.id
where membership.role = 'owner'
order by location.billing_account_id, membership.created_at
on conflict (billing_account_id, user_id) do nothing;

insert into billing_private.billing_account_administrators (
  billing_account_id,
  user_id,
  role,
  created_by_user_id
)
select distinct on (account.id)
  account.id,
  member."userId",
  'owner',
  member."userId"
from public.billing_accounts account
join public."member" member on member."organizationId" = account.organization_id
where account.scope = 'organization'
  and member.role = 'owner'
order by account.id, member."createdAt"
on conflict (billing_account_id, user_id) do nothing;

insert into billing_private.location_entitlements (
  location_id,
  trial_started_at,
  trial_ends_at,
  trial_consumed_at
)
select
  location.id,
  coalesce(location_trial.trial_started_at, organization_trial.trial_started_at, location.created_at),
  coalesce(location_trial.trial_ends_at, organization_trial.trial_ends_at, location.created_at + interval '14 days'),
  coalesce(location_trial.trial_started_at, organization_trial.trial_started_at, location.created_at)
from public.locations location
left join public.workspace_trials location_trial
  on location_trial.location_id = location.id
left join public.workspace_trials organization_trial
  on organization_trial.organization_id = location.organization_id
on conflict (location_id) do nothing;

insert into billing_private.location_hardware_entitlements (location_id)
select id from public.locations
on conflict (location_id) do nothing;

insert into billing_private.location_addons (
  location_id,
  addon_type,
  status,
  legacy_opt_in_deadline
)
select
  settings.location_id,
  'time_attendance',
  'legacy_pending',
  subscription.current_period_end
from public.location_clock_settings settings
join public.locations location on location.id = settings.location_id
left join lateral (
  select current_period_end
  from public.billing_subscriptions
  where billing_account_id = location.billing_account_id
    and status in ('trialing', 'active', 'past_due')
  order by created_at desc
  limit 1
) subscription on true
where settings.is_enabled = true
on conflict (location_id, addon_type) do nothing;

insert into billing_private.location_billing_periods (
  location_id,
  billing_account_id,
  stripe_subscription_id,
  period_start,
  period_end
)
select
  location.id,
  subscription.billing_account_id,
  subscription.stripe_subscription_id,
  subscription.current_period_start,
  subscription.current_period_end
from public.billing_subscriptions subscription
join public.locations location on location.billing_account_id = subscription.billing_account_id
where subscription.current_period_start is not null
  and subscription.current_period_end is not null
  and subscription.status in ('trialing', 'active', 'past_due', 'unpaid', 'paused')
on conflict (location_id, period_start, period_end) do nothing;

create or replace function billing_private.qualifying_employee_count(
  target_location_id uuid,
  target_period_start timestamptz,
  target_period_end timestamptz
)
returns integer
language sql
stable
security definer
set search_path = public, billing_private
as $$
  with qualifying_employees as (
    select employee.id
    from public.employees employee
    where employee.location_id = target_location_id
      and employee.status = 'active'

    union

    select assignment.employee_id
    from public.employee_location_assignments assignment
    join public.employees employee on employee.id = assignment.employee_id
    where assignment.location_id = target_location_id
      and assignment.is_enabled = true
      and assignment.disabled_at is null
      and employee.status = 'active'

    union

    select assignment.employee_id
    from public.rota_published_shift_assignments assignment
    join public.rota_published_shifts shift
      on shift.id = assignment.rota_published_shift_id
    join public.rotas rota on rota.id = shift.rota_id
    where rota.location_id = target_location_id
      and shift.day_date >= target_period_start::date
      and shift.day_date < target_period_end::date
  )
  select count(*)::integer from qualifying_employees
$$;

create or replace function billing_private.initialize_location_billing_records()
returns trigger
language plpgsql
security definer
set search_path = public, billing_private
as $$
declare
  inherited_trial public.workspace_trials%rowtype;
begin
  if new.organization_id is not null then
    select * into inherited_trial
    from public.workspace_trials
    where organization_id = new.organization_id
    limit 1;
  end if;

  insert into billing_private.location_entitlements (
    location_id,
    trial_started_at,
    trial_ends_at,
    trial_consumed_at
  ) values (
    new.id,
    coalesce(inherited_trial.trial_started_at, new.created_at),
    coalesce(inherited_trial.trial_ends_at, new.created_at + interval '14 days'),
    coalesce(inherited_trial.trial_started_at, new.created_at)
  ) on conflict (location_id) do nothing;

  insert into billing_private.location_hardware_entitlements (location_id)
  values (new.id)
  on conflict (location_id) do nothing;

  return new;
end;
$$;

drop trigger if exists locations_initialize_billing_records on public.locations;
create trigger locations_initialize_billing_records
after insert on public.locations
for each row execute function billing_private.initialize_location_billing_records();

create or replace function billing_private.capture_location_usage(
  target_location_id uuid,
  usage_source text,
  observed_at timestamptz default timezone('utc', now())
)
returns void
language plpgsql
security definer
set search_path = public, billing_private
as $$
declare
  billing_period billing_private.location_billing_periods%rowtype;
  observed_count integer;
  next_high_water integer;
begin
  for billing_period in
    select *
    from billing_private.location_billing_periods
    where location_id = target_location_id
      and finalized_at is null
      and period_start <= observed_at
      and observed_at < period_end
    for update
  loop
    observed_count := billing_private.qualifying_employee_count(
      target_location_id,
      billing_period.period_start,
      billing_period.period_end
    );
    next_high_water := greatest(billing_period.high_water_employee_count, observed_count);

    update billing_private.location_billing_periods
    set high_water_employee_count = next_high_water,
        last_observed_at = observed_at,
        updated_at = timezone('utc', now())
    where id = billing_period.id;

    insert into billing_private.location_billing_usage_snapshots (
      location_billing_period_id,
      observed_employee_count,
      high_water_employee_count,
      source,
      observed_at
    ) values (
      billing_period.id,
      observed_count,
      next_high_water,
      usage_source,
      observed_at
    );
  end loop;
end;
$$;

create or replace function billing_private.capture_employee_usage_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, billing_private
as $$
declare
  affected_location_id uuid;
  affected_employee_id uuid := coalesce(new.id, old.id);
begin
  for affected_location_id in
    select location_id from (
      select old.location_id
      union
      select new.location_id
      union
      select assignment.location_id
      from public.employee_location_assignments assignment
      where assignment.employee_id = affected_employee_id
    ) locations
    where location_id is not null
  loop
    perform billing_private.capture_location_usage(affected_location_id, 'status_change');
  end loop;
  return coalesce(new, old);
end;
$$;

create or replace function billing_private.capture_assignment_usage_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, billing_private
as $$
begin
  if old.location_id is not null then
    perform billing_private.capture_location_usage(old.location_id, 'location_assignment');
  end if;
  if new.location_id is not null and new.location_id is distinct from old.location_id then
    perform billing_private.capture_location_usage(new.location_id, 'location_assignment');
  end if;
  return coalesce(new, old);
end;
$$;

create or replace function billing_private.capture_published_assignment_usage_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, billing_private
as $$
declare
  target_shift_id uuid := coalesce(new.rota_published_shift_id, old.rota_published_shift_id);
  target_location_id uuid;
begin
  select rota.location_id into target_location_id
  from public.rota_published_shifts shift
  join public.rotas rota on rota.id = shift.rota_id
  where shift.id = target_shift_id;

  if target_location_id is not null then
    perform billing_private.capture_location_usage(target_location_id, 'published_rota');
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists employees_capture_billing_usage on public.employees;
create trigger employees_capture_billing_usage
after insert or update of status, location_id on public.employees
for each row execute function billing_private.capture_employee_usage_trigger();

drop trigger if exists employee_assignments_capture_billing_usage on public.employee_location_assignments;
create trigger employee_assignments_capture_billing_usage
after insert or update of location_id, is_enabled, disabled_at or delete on public.employee_location_assignments
for each row execute function billing_private.capture_assignment_usage_trigger();

drop trigger if exists published_assignments_capture_billing_usage on public.rota_published_shift_assignments;
create trigger published_assignments_capture_billing_usage
after insert or update of rota_published_shift_id, employee_id or delete on public.rota_published_shift_assignments
for each row execute function billing_private.capture_published_assignment_usage_trigger();

select billing_private.capture_location_usage(location_id, 'backfill')
from billing_private.location_billing_periods
where finalized_at is null;

grant usage on schema billing_private to postgres, service_role;
grant all on all tables in schema billing_private to postgres, service_role;
grant execute on all functions in schema billing_private to postgres, service_role;
