-- NULL supports old application writes; an explicit empty array means no locations.
-- Keep the location selection on the request even after its invite is replaced.
alter table public.staff_invite_links alter column location_id drop not null;
alter table public.staff_invite_links add column location_ids uuid[];
alter table public.staff_join_requests add column location_ids uuid[];

update public.staff_invite_links set location_ids = array_remove(array[location_id], null);
update public.staff_join_requests set location_ids = array_remove(array[location_id], null);

alter table public.staff_invite_links add constraint staff_invite_locations_limit
  check (cardinality(location_ids) <= 100 and array_position(location_ids, null) is null);
alter table public.staff_join_requests add constraint staff_join_locations_limit
  check (cardinality(location_ids) <= 100 and array_position(location_ids, null) is null);

create index staff_join_requests_pending_user_org_idx
  on public.staff_join_requests (organization_id, user_id) where status = 'pending';
