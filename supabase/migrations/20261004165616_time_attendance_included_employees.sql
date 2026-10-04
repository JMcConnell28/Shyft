create or replace function billing_private.time_attendance_overage_employee_ids(target_period_id uuid)
returns table (employee_id uuid)
language sql
stable
security invoker
set search_path = ''
as $$
  with location_employees as (
    select usage.location_id, usage.employee_id, min(usage.usage_at) as first_usage_at
    from billing_private.organization_employee_usage_events usage
    where usage.organization_billing_period_id = target_period_id
      and usage.time_attendance_billable
    group by usage.location_id, usage.employee_id
  ), ranked_employees as (
    select employee_id,
           row_number() over (partition by location_id order by first_usage_at, employee_id) as allowance_position
    from location_employees
  )
  select distinct ranked.employee_id
  from ranked_employees ranked
  join billing_private.organization_billing_periods period on period.id = target_period_id
  where ranked.allowance_position > period.included_employee_count
$$;

revoke all on function billing_private.time_attendance_overage_employee_ids(uuid) from public, anon, authenticated;
grant execute on function billing_private.time_attendance_overage_employee_ids(uuid) to postgres, service_role;

create or replace function billing_private.refresh_organization_billing_period_counts(target_period_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  used_count integer;
  ta_count integer;
begin
  select count(distinct employee_id)::integer
  into used_count
  from billing_private.organization_employee_usage_events
  where organization_billing_period_id = target_period_id;

  select count(*)::integer into ta_count
  from billing_private.time_attendance_overage_employee_ids(target_period_id);

  update billing_private.organization_billing_periods period
  set used_employee_count = coalesce(used_count, 0),
      extra_employee_count = greatest(coalesce(used_count, 0) - period.included_employee_count, 0),
      time_attendance_employee_count = coalesce(ta_count, 0),
      last_observed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where period.id = target_period_id;
end;
$$;

-- Open periods use the new per-location allowance immediately.
select billing_private.refresh_organization_billing_period_counts(id)
from billing_private.organization_billing_periods
where finalized_at is null;

-- Correct unpaid usage without rewriting usage already submitted to Stripe.
update billing_private.organization_billing_periods period
set time_attendance_employee_count = counts.quantity,
    finalized_time_attendance_employee_count = counts.quantity,
    updated_at = timezone('utc', now())
from (
  select period.id, count(overage.employee_id)::integer as quantity
  from billing_private.organization_billing_periods period
  left join lateral billing_private.time_attendance_overage_employee_ids(period.id) overage on true
  where period.finalized_at is not null
    and not exists (
      select 1 from billing_private.billing_meter_submissions submission
      where submission.organization_billing_period_id = period.id
        and submission.item_type = 'time_attendance_employee'
        and submission.status in ('submitted', 'skipped')
    )
  group by period.id
) counts
where period.id = counts.id;

update billing_private.billing_meter_submissions submission
set quantity = period.finalized_time_attendance_employee_count,
    updated_at = timezone('utc', now())
from billing_private.organization_billing_periods period
where submission.organization_billing_period_id = period.id
  and submission.item_type = 'time_attendance_employee'
  and submission.status in ('pending', 'failed')
  and period.finalized_time_attendance_employee_count is not null;
