-- Explicit grants for the existing server-only supabase-js queries. New Supabase
-- projects no longer supply these automatically. Direct-Postgres-only tables,
-- browser roles, default privileges and function permissions are untouched.
set local lock_timeout = '5s';

grant select on table
  public.clock_attempts,
  public.clock_scan_sessions,
  public.clock_tags,
  public.employee_location_assignments,
  public.employees,
  public.invitation,
  public.location_clock_settings,
  public.locations,
  public.organization,
  public.organization_onboarding_states,
  public.rota_published_shift_assignments,
  public.rota_published_shifts,
  public.rota_reads,
  public.rota_shift_assignments,
  public.rota_shifts,
  public.rotas,
  public.staff_groups,
  public.staff_invite_links,
  public.time_entries,
  public."user",
  public.zones
to service_role;

-- Supabase upserts require both INSERT and UPDATE privileges.
grant insert on table
  public.clock_events,
  public.location_clock_settings,
  public.organization_onboarding_states,
  public.rota_published_shift_assignments,
  public.rota_reads,
  public.rota_shift_assignments,
  public.time_entries
to service_role;

grant update on table
  public.location_clock_settings,
  public.organization_onboarding_states,
  public.rota_reads,
  public.rota_shift_assignments,
  public.rotas,
  public.staff_groups,
  public.staff_invite_links,
  public.time_entries
to service_role;

grant delete on table
  public.rota_published_shifts,
  public.rota_shift_assignments
to service_role;

notify pgrst, 'reload schema';
