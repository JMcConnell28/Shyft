create table if not exists billing_private.organization_billing_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  billing_account_id uuid not null references public.billing_accounts(id) on delete restrict,
  stripe_subscription_id text,
  period_start timestamptz not null,
  period_end timestamptz not null,
  included_employee_count integer not null default 10 check (included_employee_count >= 0),
  used_employee_count integer not null default 0 check (used_employee_count >= 0),
  extra_employee_count integer not null default 0 check (extra_employee_count >= 0),
  time_attendance_employee_count integer not null default 0 check (time_attendance_employee_count >= 0),
  finalized_used_employee_count integer check (finalized_used_employee_count is null or finalized_used_employee_count >= 0),
  finalized_extra_employee_count integer check (finalized_extra_employee_count is null or finalized_extra_employee_count >= 0),
  finalized_time_attendance_employee_count integer check (finalized_time_attendance_employee_count is null or finalized_time_attendance_employee_count >= 0),
  finalized_at timestamptz,
  last_observed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (period_end > period_start),
  unique (billing_account_id, period_start, period_end)
);

create index if not exists organization_billing_periods_org_period_idx
  on billing_private.organization_billing_periods (organization_id, period_start, period_end);

create index if not exists organization_billing_periods_open_idx
  on billing_private.organization_billing_periods (period_end)
  where finalized_at is null;

create table if not exists billing_private.organization_employee_usage_events (
  id bigint generated always as identity primary key,
  organization_billing_period_id uuid not null references billing_private.organization_billing_periods(id) on delete cascade,
  organization_id text not null references public."organization"(id) on delete cascade,
  billing_account_id uuid not null references public.billing_accounts(id) on delete restrict,
  location_id uuid not null references public.locations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  usage_source text not null check (usage_source in ('published_rota_assignment', 'time_entry')),
  source_record_id uuid not null,
  usage_at timestamptz not null,
  time_attendance_billable boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (usage_source, source_record_id)
);

create index if not exists organization_usage_events_period_employee_idx
  on billing_private.organization_employee_usage_events (
    organization_billing_period_id,
    employee_id
  );

create index if not exists organization_usage_events_location_period_idx
  on billing_private.organization_employee_usage_events (
    location_id,
    organization_billing_period_id
  );

create index if not exists organization_usage_events_ta_idx
  on billing_private.organization_employee_usage_events (
    organization_billing_period_id,
    employee_id
  )
  where time_attendance_billable = true;

create table if not exists billing_private.billing_meter_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_billing_period_id uuid not null references billing_private.organization_billing_periods(id) on delete cascade,
  item_type text not null check (item_type in ('core_extra_employee', 'time_attendance_employee')),
  stripe_customer_id text not null,
  stripe_subscription_item_id text,
  stripe_meter_event_identifier text not null,
  quantity integer not null check (quantity >= 0),
  status text not null default 'pending' check (status in ('pending', 'submitted', 'skipped', 'failed')),
  error_message text,
  submitted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_billing_period_id, item_type)
);

create index if not exists billing_meter_submissions_status_idx
  on billing_private.billing_meter_submissions (status, updated_at);

create or replace function billing_private.is_time_attendance_billable_usage(
  target_location_id uuid,
  target_usage_at timestamptz
)
returns boolean
language sql
stable
security definer
set search_path = public, billing_private
as $$
  select exists (
    select 1
    from billing_private.location_addons addon
    where addon.location_id = target_location_id
      and addon.addon_type = 'time_attendance'
      and addon.status in ('trialing', 'active', 'canceling')
      and coalesce(addon.activated_at, addon.billing_starts_at, '-infinity'::timestamptz) <= target_usage_at
      and (
        addon.canceled_at is null
        or target_usage_at < addon.canceled_at
      )
  )
$$;

create or replace function billing_private.refresh_organization_billing_period_counts(
  target_period_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, billing_private
as $$
declare
  used_count integer;
  ta_count integer;
begin
  select
    count(distinct employee_id)::integer,
    count(distinct employee_id) filter (where time_attendance_billable)::integer
  into used_count, ta_count
  from billing_private.organization_employee_usage_events
  where organization_billing_period_id = target_period_id;

  update billing_private.organization_billing_periods period
  set used_employee_count = coalesce(used_count, 0),
      extra_employee_count = greatest(coalesce(used_count, 0) - period.included_employee_count, 0),
      time_attendance_employee_count = coalesce(ta_count, 0),
      last_observed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where period.id = target_period_id;
end;
$$;

create or replace function billing_private.capture_organization_employee_usage(
  target_organization_id text,
  target_location_id uuid,
  target_employee_id uuid,
  target_usage_source text,
  target_source_record_id uuid,
  target_usage_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, billing_private
as $$
declare
  billing_period record;
  previous_period_id uuid;
begin
  if target_organization_id is null
    or target_location_id is null
    or target_employee_id is null
    or target_source_record_id is null
    or target_usage_at is null then
    return;
  end if;

  for billing_period in
    select period.*
    from billing_private.organization_billing_periods period
    where period.organization_id = target_organization_id
      and period.period_start <= target_usage_at
      and target_usage_at < period.period_end
      and period.finalized_at is null
    for update
  loop
    select organization_billing_period_id into previous_period_id
    from billing_private.organization_employee_usage_events
    where usage_source = target_usage_source
      and source_record_id = target_source_record_id;

    insert into billing_private.organization_employee_usage_events (
      organization_billing_period_id,
      organization_id,
      billing_account_id,
      location_id,
      employee_id,
      usage_source,
      source_record_id,
      usage_at,
      time_attendance_billable
    ) values (
      billing_period.id,
      billing_period.organization_id,
      billing_period.billing_account_id,
      target_location_id,
      target_employee_id,
      target_usage_source,
      target_source_record_id,
      target_usage_at,
      billing_private.is_time_attendance_billable_usage(
        target_location_id,
        target_usage_at
      )
    )
    on conflict (usage_source, source_record_id)
    do update set organization_billing_period_id = excluded.organization_billing_period_id,
                  organization_id = excluded.organization_id,
                  billing_account_id = excluded.billing_account_id,
                  location_id = excluded.location_id,
                  employee_id = excluded.employee_id,
                  usage_at = excluded.usage_at,
                  time_attendance_billable = excluded.time_attendance_billable;

    perform billing_private.refresh_organization_billing_period_counts(billing_period.id);

    if previous_period_id is not null
      and previous_period_id <> billing_period.id then
      perform billing_private.refresh_organization_billing_period_counts(previous_period_id);
    end if;
  end loop;
end;
$$;

create or replace function billing_private.capture_organization_period_usage(
  target_period_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, billing_private
as $$
declare
  target_period billing_private.organization_billing_periods%rowtype;
begin
  select * into target_period
  from billing_private.organization_billing_periods
  where id = target_period_id;

  if not found then
    return;
  end if;

  insert into billing_private.organization_employee_usage_events (
    organization_billing_period_id,
    organization_id,
    billing_account_id,
    location_id,
    employee_id,
    usage_source,
    source_record_id,
    usage_at,
    time_attendance_billable
  )
  select
    target_period.id,
    target_period.organization_id,
    target_period.billing_account_id,
    rota.location_id,
    assignment.employee_id,
    'published_rota_assignment',
    assignment.id,
    (shift.day_date::timestamp at time zone 'Europe/London'),
    billing_private.is_time_attendance_billable_usage(
      rota.location_id,
      (shift.day_date::timestamp at time zone 'Europe/London')
    )
  from public.rota_published_shift_assignments assignment
  join public.rota_published_shifts shift
    on shift.id = assignment.rota_published_shift_id
  join public.rotas rota on rota.id = shift.rota_id
  where rota.organization_id = target_period.organization_id
    and shift.day_date >= target_period.period_start::date
    and shift.day_date < target_period.period_end::date
  on conflict (usage_source, source_record_id)
  do update set organization_billing_period_id = excluded.organization_billing_period_id,
                organization_id = excluded.organization_id,
                billing_account_id = excluded.billing_account_id,
                location_id = excluded.location_id,
                employee_id = excluded.employee_id,
                usage_at = excluded.usage_at,
                time_attendance_billable = excluded.time_attendance_billable;

  insert into billing_private.organization_employee_usage_events (
    organization_billing_period_id,
    organization_id,
    billing_account_id,
    location_id,
    employee_id,
    usage_source,
    source_record_id,
    usage_at,
    time_attendance_billable
  )
  select
    target_period.id,
    target_period.organization_id,
    target_period.billing_account_id,
    entry.location_id,
    entry.employee_id,
    'time_entry',
    entry.id,
    coalesce(entry.scheduled_start_at, entry.clocked_in_at, entry.payable_start_at, entry.created_at),
    billing_private.is_time_attendance_billable_usage(
      entry.location_id,
      coalesce(entry.scheduled_start_at, entry.clocked_in_at, entry.payable_start_at, entry.created_at)
    )
  from public.time_entries entry
  where entry.organization_id = target_period.organization_id
    and coalesce(entry.scheduled_start_at, entry.clocked_in_at, entry.payable_start_at, entry.created_at) >= target_period.period_start
    and coalesce(entry.scheduled_start_at, entry.clocked_in_at, entry.payable_start_at, entry.created_at) < target_period.period_end
  on conflict (usage_source, source_record_id)
  do update set organization_billing_period_id = excluded.organization_billing_period_id,
                organization_id = excluded.organization_id,
                billing_account_id = excluded.billing_account_id,
                location_id = excluded.location_id,
                employee_id = excluded.employee_id,
                usage_at = excluded.usage_at,
                time_attendance_billable = excluded.time_attendance_billable;

  perform billing_private.refresh_organization_billing_period_counts(target_period.id);
end;
$$;

create or replace function billing_private.capture_published_assignment_organization_usage_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, billing_private
as $$
declare
  target_shift_id uuid := coalesce(new.rota_published_shift_id, old.rota_published_shift_id);
  target_employee_id uuid := coalesce(new.employee_id, old.employee_id);
  target_source_record_id uuid := coalesce(new.id, old.id);
  target_organization_id text;
  target_location_id uuid;
  target_usage_at timestamptz;
begin
  select
    rota.organization_id,
    rota.location_id,
    (shift.day_date::timestamp at time zone 'Europe/London')
  into target_organization_id, target_location_id, target_usage_at
  from public.rota_published_shifts shift
  join public.rotas rota on rota.id = shift.rota_id
  where shift.id = target_shift_id;

  perform billing_private.capture_organization_employee_usage(
    target_organization_id,
    target_location_id,
    target_employee_id,
    'published_rota_assignment',
    target_source_record_id,
    target_usage_at
  );

  return coalesce(new, old);
end;
$$;

create or replace function billing_private.capture_time_entry_organization_usage_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, billing_private
as $$
begin
  perform billing_private.capture_organization_employee_usage(
    new.organization_id,
    new.location_id,
    new.employee_id,
    'time_entry',
    new.id,
    coalesce(new.scheduled_start_at, new.clocked_in_at, new.payable_start_at, new.created_at)
  );

  return new;
end;
$$;

drop trigger if exists published_assignments_capture_organization_billing_usage on public.rota_published_shift_assignments;
create trigger published_assignments_capture_organization_billing_usage
after insert or update of rota_published_shift_id, employee_id on public.rota_published_shift_assignments
for each row execute function billing_private.capture_published_assignment_organization_usage_trigger();

drop trigger if exists time_entries_capture_organization_billing_usage on public.time_entries;
create trigger time_entries_capture_organization_billing_usage
after insert or update of organization_id, location_id, employee_id, scheduled_start_at, clocked_in_at, payable_start_at on public.time_entries
for each row execute function billing_private.capture_time_entry_organization_usage_trigger();

insert into billing_private.organization_billing_periods (
  organization_id,
  billing_account_id,
  stripe_subscription_id,
  period_start,
  period_end
)
select distinct
  account.organization_id,
  subscription.billing_account_id,
  subscription.stripe_subscription_id,
  subscription.current_period_start,
  subscription.current_period_end
from public.billing_subscriptions subscription
join public.billing_accounts account on account.id = subscription.billing_account_id
where account.organization_id is not null
  and subscription.current_period_start is not null
  and subscription.current_period_end is not null
  and subscription.status in ('trialing', 'active', 'past_due', 'unpaid', 'paused')
on conflict (billing_account_id, period_start, period_end)
do update set stripe_subscription_id = excluded.stripe_subscription_id,
              updated_at = timezone('utc', now());

select billing_private.capture_organization_period_usage(id)
from billing_private.organization_billing_periods
where finalized_at is null;

grant all on all tables in schema billing_private to postgres, service_role;
grant execute on all functions in schema billing_private to postgres, service_role;
