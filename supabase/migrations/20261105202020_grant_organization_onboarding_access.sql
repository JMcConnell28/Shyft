-- New projects require explicit Data API grants. Only the server-side service
-- role uses these onboarding queries; browser roles retain their existing access.
set local lock_timeout = '5s';

grant select on table
  public.organization_onboarding_states,
  public.staff_groups,
  public.locations,
  public.zones,
  public.staff_invite_links
to service_role;

-- Onboarding state is upserted through the server Data API. Default staff-group
-- creation uses Postgres directly; only normalization updates use the Data API.
grant insert, update on table public.organization_onboarding_states to service_role;
grant update on table public.staff_groups to service_role;

notify pgrst, 'reload schema';
