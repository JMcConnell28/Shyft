// Parameters: processing time, scheduled delay, unscheduled limit, batch size.
const automaticClockOutSql = `
  with overdue as (
    select te.id,
      greatest(te.clocked_in_at, coalesce(te.scheduled_end_at,
        te.clocked_in_at + make_interval(mins => coalesce(c.unscheduled_clock_out_after_minutes, $3::int)))) as estimated_end
    from public.time_entries te
    left join public.location_clock_settings c on c.location_id = te.location_id
    where te.clocked_out_at is null
      and coalesce(te.scheduled_end_at + make_interval(mins => coalesce(c.hard_review_after_minutes, $2::int)),
        te.clocked_in_at + make_interval(mins => coalesce(c.unscheduled_clock_out_after_minutes, $3::int))) <= $1::timestamptz
    order by coalesce(te.scheduled_end_at, te.clocked_in_at), te.id
    limit $4::int for update of te skip locked
  ), closed as (
    update public.time_entries te
    set clocked_out_at = overdue.estimated_end,
        payable_end_at = greatest(overdue.estimated_end, te.payable_start_at),
        auto_clocked_out_at = $1::timestamptz,
        updated_at = $1::timestamptz,
        updated_by = null,
        status = 'requires_review',
        notes = concat_ws(E'\n', nullif(te.notes, ''),
          'Automatically clocked out. Finish time is estimated; manager review required.')
    from overdue where te.id = overdue.id and te.clocked_out_at is null
    returning te.id, te.employee_id, te.location_id, te.organization_id,
      te.clocked_in_at, te.clocked_out_at, te.scheduled_end_at
  ), audited as (
    insert into public.clock_events
      (time_entry_id, employee_id, location_id, organization_id, event_type, event_at, reason, metadata)
    select id, employee_id, location_id, organization_id, 'auto_clock_out', clocked_out_at,
      'Automatic clock-out; manager must confirm the actual finish time.',
      jsonb_build_object('processed_at', $1::timestamptz, 'estimated_end_at', clocked_out_at,
        'scheduled_end_at', scheduled_end_at, 'clocked_in_at', clocked_in_at)
    from closed returning id
  ) select count(*)::int as closed from audited
`

// Parameters: processing time, reminder delay, scheduled delay, unscheduled
// limit, lease duration, batch size, unscheduled reminder lead.
const claimClockRemindersSql = `
  with due as (
    select te.id from public.time_entries te
    left join public.location_clock_settings c on c.location_id = te.location_id
    where te.clocked_out_at is null and te.clock_out_reminder_sent_at is null
      and (te.clock_out_reminder_claimed_at is null
        or te.clock_out_reminder_claimed_at <= $1::timestamptz - make_interval(mins => $5::int))
      and coalesce(te.scheduled_end_at + make_interval(mins => coalesce(c.forgotten_clock_out_alert_minutes, $2::int)),
        te.clocked_in_at + make_interval(mins => coalesce(c.unscheduled_clock_out_after_minutes, $4::int)
          - coalesce(c.unscheduled_clock_out_reminder_minutes, $7::int))) <= $1::timestamptz
      and coalesce(te.scheduled_end_at + make_interval(mins => coalesce(c.hard_review_after_minutes, $3::int)),
        te.clocked_in_at + make_interval(mins => coalesce(c.unscheduled_clock_out_after_minutes, $4::int))) > $1::timestamptz
    order by coalesce(te.scheduled_end_at, te.clocked_in_at), te.id
    limit $6::int for update of te skip locked
  ), claimed as (
    update public.time_entries te set clock_out_reminder_claimed_at = $1::timestamptz
    from due where te.id = due.id
    returning te.id, te.employee_id, te.location_id, te.scheduled_end_at
  ) select claimed.id, employee.user_id as "userId",
      coalesce(org.slug, location.slug) as "workspaceSlug",
      claimed.scheduled_end_at is not null as scheduled,
      coalesce(c.unscheduled_clock_out_after_minutes, $4::int) as "limitMinutes"
    from claimed
    join public.employees employee on employee.id = claimed.employee_id
    join public.locations location on location.id = claimed.location_id
    left join public."organization" org on org.id = location.organization_id
    left join public.location_clock_settings c on c.location_id = claimed.location_id
`

export { automaticClockOutSql, claimClockRemindersSql }
