import { dashboardScheduleSql, matchingArrivalSql } from "./schedule-sql"

const unresolvedArrivalSql = `
  w.clock_enabled and w.starts_at >= w.tracking_started_at
  and w.starts_at + make_interval(mins => w.late_grace) < $4::timestamptz
  and not exists (${matchingArrivalSql})
  and not exists (
    select 1 from public.dashboard_arrival_resolutions resolution
    where resolution.location_id = w.location_id and resolution.employee_id = w.employee_id
      and resolution.shift_key = w.shift_key and resolution.shift_segment = w.segment
      and resolution.scheduled_start_at = w.starts_at
  )`

const dashboardAttentionSql = `with ${dashboardScheduleSql},
  clock_issues as (
    select te.id::text as id,
      case when te.clocked_out_at is null and (
        $4::timestamptz > te.scheduled_end_at + make_interval(mins => coalesce(c.forgotten_clock_out_alert_minutes, 120))
        or $4::timestamptz > te.clocked_in_at + make_interval(mins => coalesce(c.hard_review_after_minutes, 720))
      ) then 'missing_clock_out' else 'review' end as kind,
      te.employee_id, e.full_name as employee_name, l.id as location_id, l.name as location_name,
      coalesce(c.timezone, 'Europe/London') as time_zone, te.clocked_in_at as occurred_at,
      te.notes, te.shift_segment as segment, null::uuid as assignment_id, te.clocked_out_at,
      coalesce(s.day_date, (te.clocked_in_at at time zone coalesce(c.timezone, 'Europe/London'))::date)::text as work_date
    from public.time_entries te
    join public.locations l on l.id = te.location_id
    join public.employees e on e.id = te.employee_id
    left join public.rota_published_shifts s on s.id = te.rota_published_shift_id
    left join public.location_clock_settings c on c.location_id = l.id
    where te.organization_id = $1 and te.location_id = any($2::uuid[])
      and (te.status = 'requires_review' or (te.clocked_out_at is null and (
        $4::timestamptz > te.scheduled_end_at + make_interval(mins => coalesce(c.forgotten_clock_out_alert_minutes, 120))
        or $4::timestamptz > te.clocked_in_at + make_interval(mins => coalesce(c.hard_review_after_minutes, 720))
      )))
  ), issues as materialized (
    select id, kind, employee_id, employee_name, location_id, location_name, time_zone,
      occurred_at, segment, assignment_id, clocked_out_at, work_date, 0 as priority,
      case when kind = 'missing_clock_out' then
        'Clock-out not recorded beyond the configured review threshold.' || coalesce(E'\n' || nullif(notes, ''), '')
      else coalesce(nullif(btrim(notes), ''), 'Time entry requires manager review; no reason was recorded.') end as reason
    from clock_issues
    union all
    select w.assignment_id::text || ':' || w.segment, 'arrival', w.employee_id, w.employee_name,
      w.location_id, w.location_name, w.time_zone, w.starts_at, w.segment, w.assignment_id, null::timestamptz, w.day_date::text, 1,
      'Arrival not recorded after the ' || w.late_grace || '-minute grace period. Confirm with the employee; this is not a recorded absence.'
    from schedule_windows w where ${unresolvedArrivalSql}
    union all
    select request.id::text, request.request_type, request.requester_employee_id,
      e.full_name, l.id, l.name, coalesce(c.timezone, 'Europe/London'), request.created_at,
      'full', null::uuid, null::timestamptz, source.day_date::text, 2,
      case when request.status = 'pending_manager' then
        case when request.request_type = 'cover' then 'Cover request awaiting manager approval.' else 'Shift swap awaiting manager approval.' end
      else 'Open cover request awaiting a volunteer.' end
    from public.shift_swap_requests request
    join public.locations l on l.id = request.location_id
    join public."organization" org on org.id = l.organization_id
    join public.employees e on e.id = request.requester_employee_id
    join public.rota_published_shifts source on source.id = request.source_published_shift_id
    left join public.location_clock_settings c on c.location_id = l.id
    where l.organization_id = $1 and l.id = any($3::uuid[])
      and org.shift_swaps_enabled and $7::boolean
      and (request.status = 'pending_manager' or (request.request_type = 'cover' and request.status = 'open'))
  ), totals as (select count(*)::int as total from issues),
  paged as (
    select * from issues order by priority, occurred_at, id
    limit $5 offset (least($6, greatest(1, ceil((select total from totals)::numeric / $5)::int)) - 1) * $5
  )
  select total, coalesce((select jsonb_agg(to_jsonb(paged) order by priority, occurred_at, id) from paged), '[]'::jsonb) as items
  from totals`

export { dashboardAttentionSql, unresolvedArrivalSql }
