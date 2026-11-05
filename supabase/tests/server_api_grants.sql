-- Run against a migrated database as postgres. Every operation is rolled back.
begin;
do $$
declare
  requirement record;
  privilege text;
  target regclass;
begin
  for requirement in select * from (values
      ('clock_attempts', 'SELECT'),
      ('clock_events', 'INSERT'),
      ('clock_scan_sessions', 'SELECT'),
      ('clock_tags', 'SELECT'),
      ('employee_location_assignments', 'SELECT'),
      ('employees', 'SELECT'),
      ('invitation', 'SELECT'),
      ('location_clock_settings', 'INSERT,SELECT,UPDATE'),
      ('locations', 'SELECT'),
      ('organization', 'SELECT'),
      ('organization_onboarding_states', 'INSERT,SELECT,UPDATE'),
      ('rota_published_shift_assignments', 'INSERT,SELECT'),
      ('rota_published_shifts', 'DELETE,SELECT'),
      ('rota_reads', 'INSERT,SELECT,UPDATE'),
      ('rota_shift_assignments', 'DELETE,INSERT,SELECT,UPDATE'),
      ('rota_shifts', 'SELECT'),
      ('rotas', 'SELECT,UPDATE'),
      ('staff_groups', 'SELECT,UPDATE'),
      ('staff_invite_links', 'SELECT,UPDATE'),
      ('time_entries', 'INSERT,SELECT,UPDATE'),
      ('user', 'SELECT'),
      ('zones', 'SELECT')
  ) as expected(table_name, privileges)
  loop
    target := format('public.%I', requirement.table_name)::regclass;
    foreach privilege in array string_to_array(requirement.privileges, ',') loop
      if not has_table_privilege('service_role', target, privilege) then
        raise exception 'Missing service_role % on %', privilege, target;
      end if;
    end loop;
    if not (select relrowsecurity from pg_class where oid = target) then
      raise exception 'RLS is disabled on %', target;
    end if;
    if has_table_privilege('anon', target, 'SELECT,INSERT,UPDATE,DELETE')
       or has_table_privilege('authenticated', target, 'SELECT,INSERT,UPDATE,DELETE') then
      raise exception 'Unexpected browser-role access on %', target;
    end if;
  end loop;
end;
$$;

-- Exercise real queries under the same role used by the server Data API.
set local role service_role;
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'clock_attempts',
    'clock_scan_sessions',
    'clock_tags',
    'employee_location_assignments',
    'employees',
    'invitation',
    'location_clock_settings',
    'locations',
    'organization',
    'organization_onboarding_states',
    'rota_published_shift_assignments',
    'rota_published_shifts',
    'rota_reads',
    'rota_shift_assignments',
    'rota_shifts',
    'rotas',
    'staff_groups',
    'staff_invite_links',
    'time_entries',
    'user',
    'zones'
  ] loop
    execute format('select 1 from public.%I limit 0', table_name);
  end loop;
end;
$$;
-- Exercise a real clock-settings upsert; restore the original state at rollback.
insert into public.location_clock_settings (location_id, organization_id)
select id, organization_id from public.locations order by created_at limit 1
on conflict (location_id) do update set organization_id = excluded.organization_id;

-- Check rota writes without modifying any customer records.
update public.rotas set note = note where false;
delete from public.rota_published_shifts where false;
rollback;
