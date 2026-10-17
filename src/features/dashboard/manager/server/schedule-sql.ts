import { dashboardZonedTimeSql } from "./zoned-time-sql"

// $1 is the organisation; $2 is the permitted location IDs. Reused by day and
// unresolved-arrival queries so split, closing and overnight rules stay identical.
const dashboardScheduleSql = `
  schedule_base as (
    select a.id as assignment_id, a.employee_id, e.full_name as employee_name, e.status as employee_status,
           s.id as shift_id, s.rota_id, r.location_id, l.name as location_name,
           jsonb_build_array(s.rota_id, s.day_date, s.zone_name_snapshot, s.shift_type,
             s.start_time, s.end_time, s.end_kind, s.split_second_start_time,
             s.split_second_end_time)::text as shift_key,
           s.zone_name_snapshot as zone, s.day_date, s.shift_type, s.start_time,
           s.end_time, s.end_kind, s.split_second_start_time, s.split_second_end_time,
           coalesce(c.timezone, 'Europe/London') as time_zone,
           coalesce(c.late_clock_in_grace_minutes, 5) as late_grace,
           c.created_at as tracking_started_at, coalesce(c.is_enabled, false) as clock_enabled,
           coalesce(h.close_time, l.estimated_closing_time) as close_time,
           coalesce(h.close_time_next_day, l.estimated_closing_time_next_day) as close_next_day
    from public.rota_published_shift_assignments a
    join public.rota_published_shifts s on s.id = a.rota_published_shift_id
    join public.rotas r on r.id = s.rota_id
    join public.locations l on l.id = r.location_id
    join public.employees e on e.id = a.employee_id
    left join public.location_clock_settings c on c.location_id = l.id
    left join public.location_operating_hours h on h.location_id = l.id
      and h.weekday = extract(isodow from s.day_date)::int
    where r.organization_id = $1 and r.location_id = any($2::uuid[])
      and r.status = 'published'
  ), segment_times as (
    select b.*, v.segment, v.segment_day, v.start_clock,
           case when v.is_closing then b.close_time else v.end_clock end as end_clock,
           v.is_closing
    from schedule_base b
    cross join lateral (
      select case when b.shift_type = 'split' then 'split_first' else 'full' end as segment,
             b.day_date as segment_day, b.start_time as start_clock, b.end_time as end_clock,
             coalesce(b.shift_type <> 'split' and (b.end_kind = 'location_close' or b.shift_type = 'closing'), false) as is_closing
      union all
      select 'split_second',
             b.day_date + case when b.end_time <= b.start_time then 1 else 0 end
               + case when b.split_second_start_time <= b.end_time then 1 else 0 end,
             b.split_second_start_time, b.split_second_end_time,
             coalesce(b.end_kind = 'location_close', false)
      where b.shift_type = 'split'
    ) v
  ), local_windows as (
    select t.*,
           (segment_day + start_clock) as local_start,
           (greatest(
              segment_day + case when end_clock <= start_clock then 1 else 0 end,
              case when is_closing and close_next_day then day_date + 1 else segment_day end
            ) + end_clock) as local_end
    from segment_times t
  ), schedule_windows as (
    select t.*, ${dashboardZonedTimeSql("local_start")} as starts_at,
           ${dashboardZonedTimeSql("local_end")} as ends_at
    from local_windows t
  )`

// An unmatched clock-in overlapping the shift also counts as an arrival. A
// missing published-shift link alone must never imply someone did not arrive.
const matchingArrivalSql = `
  select 1 from public.time_entries te
  where te.employee_id = w.employee_id and te.location_id = w.location_id
    and te.organization_id = $1
    and ((te.rota_published_shift_id = w.shift_id and te.shift_segment = w.segment)
      or (te.rota_published_shift_id is null and te.clocked_in_at < w.ends_at
          and coalesce(te.clocked_out_at, 'infinity'::timestamptz) > w.starts_at))`

export { dashboardScheduleSql, matchingArrivalSql }
