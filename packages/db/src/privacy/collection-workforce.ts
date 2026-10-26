const employees = `select id from public.employees where user_id = $1`
const workforceCollection = [
  {
    title: "Employee profiles, including former employment",
    sql: `select e.id, e.organization_id, e.location_id, e.full_name, e.email, e.status, e.staff_group_id, e.payroll_id, e.created_at, e.updated_at, e.offboarded_at from public.employees e where e.user_id = $1`,
  },
  {
    title: "Employee pay details",
    sql: `select employee_id, organization_id, location_id, pay_type, hourly_rate_pence, weekly_salary_pence, created_at, updated_at from public.employee_compensation where employee_id in (${employees})`,
  },
  {
    title: "Employee location and group assignments",
    sql: `select a.employee_id, a.location_id, l.name as location, a.staff_group_id, a.is_enabled, a.show_on_rota, a.created_at, a.disabled_at from public.employee_location_assignments a join public.locations l on l.id = a.location_id where a.employee_id in (${employees})`,
  },
  {
    title: "Published shifts assigned to the employee",
    sql: `select a.employee_id, s.id as shift_id, s.rota_id, s.day_date, s.zone_name_snapshot, s.shift_type, s.start_time, s.end_time, s.end_kind, s.split_second_start_time, s.split_second_end_time, r.location_id, r.published_version from public.rota_published_shift_assignments a join public.rota_published_shifts s on s.id = a.rota_published_shift_id join public.rotas r on r.id = s.rota_id where a.employee_id in (${employees})`,
  },
  {
    title: "Working rota assignments (may differ from published shifts)",
    sql: `select a.employee_id, s.id as shift_id, s.rota_id, s.day_date, s.zone_name_snapshot, s.shift_type, s.start_time, s.end_time, s.end_kind, s.split_second_start_time, s.split_second_end_time from public.rota_shift_assignments a join public.rota_shifts s on s.id = a.rota_shift_id where a.employee_id in (${employees})`,
  },
  {
    title: "Attendance and payable time",
    sql: `select id, employee_id, organization_id, location_id, rota_published_shift_id, clocked_in_at, clocked_out_at, status, source, notes, shift_segment, scheduled_start_at, scheduled_end_at, payable_start_at, payable_end_at, auto_clocked_out_at, created_at, updated_at from public.time_entries where user_id = $1 or employee_id in (${employees})`,
  },
  {
    title: "Attendance corrections and clock events",
    sql: `select id, time_entry_id, employee_id, location_id, event_type, event_at, reason, metadata, created_at from public.clock_events where employee_id in (${employees}) or performed_by_user_id = $1`,
  },
  {
    title: "Clocking attempts",
    sql: `select id, employee_id, location_id, action, success, failure_reason, gps_latitude, gps_longitude, gps_accuracy_meters, gps_distance_meters, ip_hash, user_agent, created_at from public.clock_attempts where employee_id in (${employees}) or performed_by_user_id = $1`,
  },
  {
    title: "Notes about the employee (requires disclosure review)",
    sql: `select id, employee_id, organization_id, location_id, category, title, body, priority, status, created_at, updated_at, archived_at from public.employee_rota_notes where employee_id in (${employees})`,
  },
  {
    title: "Arrival review records",
    sql: `select id, employee_id, location_id, shift_segment, scheduled_start_at, reason, resolved_at from public.dashboard_arrival_resolutions where employee_id in (${employees})`,
  },
  {
    title: "Swap and cover requests involving the employee",
    sql: `select id, request_type, status, rota_id, location_id, source_published_shift_id, target_published_shift_id, manager_note, cutoff_at, approved_at, denied_at, cancelled_at, created_at, updated_at from public.shift_swap_requests where requester_user_id = $1 or requester_employee_id in (${employees}) or target_employee_id in (${employees}) or id in (select request_id from public.shift_swap_responses where responder_user_id = $1)`,
  },
  {
    title: "Swap and cover responses",
    sql: `select request_id, status, responded_at, manager_handled_at, created_at, updated_at from public.shift_swap_responses where responder_user_id = $1 or responder_employee_id in (${employees})`,
  },
] as const

export { workforceCollection }
