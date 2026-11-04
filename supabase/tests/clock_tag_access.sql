-- Run inside a BEGIN / ROLLBACK transaction as postgres after the migrations.
-- Fixtures are synthetic: no existing customer records or NFC keys are read.
do $$
declare
  browser_role text;
begin
  foreach browser_role in array array['anon', 'authenticated'] loop
    if has_table_privilege(browser_role, 'public.clock_tags', 'select,insert,update,delete,truncate,references,trigger')
       or has_any_column_privilege(browser_role, 'public.clock_tags', 'select,insert,update,references') then
      raise exception 'Browser role % retains clock_tags privileges', browser_role;
    end if;
    if has_function_privilege(browser_role, 'public.claim_clock_scan_session(text,text,integer,text,text)', 'execute') then
      raise exception 'Browser role % can call the server-only scan RPC', browser_role;
    end if;
  end loop;
end;
$$;

do $$
declare
  fixture_id text := gen_random_uuid()::text;
  fixture_user text := 's02-' || fixture_id;
  fixture_location uuid := gen_random_uuid();
  fixture_employee uuid := gen_random_uuid();
  fixture_tag uuid := gen_random_uuid();
  fixture_public_id text := 'clk_' || upper(replace(gen_random_uuid()::text, '-', ''));
  fixture_session text := gen_random_uuid()::text;
  workforce_role text;
  browser_role text;
  scan jsonb;
  clock_action text;
  clock_event jsonb;
begin
  insert into public."user" (id, name, email, "emailVerified")
    values (fixture_user, 'S02 fixture', fixture_user || '@example.invalid', true);
  insert into public."organization" (id, name, slug, "createdAt")
    values (fixture_id, 'S02 fixture', 's02-' || fixture_id, now());
  insert into public.locations (id, organization_id, name, slug)
    values (fixture_location, fixture_id, 'S02 fixture', 's02-' || fixture_id);
  insert into public.location_memberships (location_id, user_id, role)
    values (fixture_location, fixture_user, 'manager');
  insert into public."session" (id, token, "userId", "expiresAt", "updatedAt")
    values (fixture_session, fixture_session, fixture_user, now() + interval '5 minutes', now());
  insert into public.employees (id, organization_id, location_id, user_id, full_name)
    values (fixture_employee, fixture_id, fixture_location, fixture_user, 'S02 fixture');
  insert into public.employee_location_assignments (organization_id, location_id, employee_id)
    values (fixture_id, fixture_location, fixture_employee);

  -- The same privileged role used by server-side scan verification can still
  -- provision tags and read their keys. These values are disposable fixtures.
  set local role service_role;
  insert into public.clock_tags (id, organization_id, location_id, label, token_hash, ntag_public_id, ntag_aes_key_hex)
    values (fixture_tag, fixture_id, fixture_location, 'S02 fixture', fixture_id, fixture_public_id, repeat('0', 32));
  if not exists (select 1 from public.clock_tags where id = fixture_tag and ntag_aes_key_hex = repeat('0', 32)) then
    raise exception 'Server-side key access is broken';
  end if;
  reset role;

  foreach workforce_role in array array['owner', 'admin', 'manager', 'supervisor'] loop
    update public.location_memberships set role = workforce_role
      where location_id = fixture_location and user_id = fixture_user;
    perform set_config('request.headers', jsonb_build_object('x-shyft-session-token', fixture_session)::text, true);
    -- Check the fixture as the server owner. S15 intentionally removes browser
    -- execution of these authorization helpers as well as direct table reads.
    if not public.has_location_role(fixture_location, array[workforce_role]) then
      raise exception 'Fixture does not reproduce a valid workforce session';
    end if;
    foreach browser_role in array array['anon', 'authenticated'] loop
      execute format('set local role %I', browser_role);
      begin
        perform ntag_aes_key_hex from public.clock_tags where id = fixture_tag;
        raise exception 'AES key is readable by % / %', browser_role, workforce_role;
      exception when insufficient_privilege then null;
      end;
      begin
        perform * from public.clock_tags where id = fixture_tag;
        raise exception 'Wildcard read is allowed for % / %', browser_role, workforce_role;
      exception when insufficient_privilege then null;
      end;
      reset role;
    end loop;
  end loop;

  set local role service_role;
  scan := public.claim_clock_scan_session(fixture_public_id, fixture_user, 1, repeat('0', 32), repeat('0', 16));
  if scan ->> 'action' <> 'clock_in' or scan ->> 'clockTagId' <> fixture_tag::text then
    raise exception 'Server-side scan claim is broken';
  end if;
  if scan ? 'ntag_aes_key_hex' or scan ? 'aesKeyHex' then
    raise exception 'Scan RPC leaked an AES key';
  end if;
  begin
    perform public.claim_clock_scan_session(fixture_public_id, fixture_user, 1, repeat('0', 32), repeat('0', 16));
    raise exception 'A replayed scan counter was accepted';
  exception when raise_exception then
    if sqlerrm <> 'counter_already_used' then raise; end if;
  end;

  foreach clock_action in array array['clock_in', 'clock_out'] loop
    if clock_action = 'clock_out' then
      scan := public.claim_clock_scan_session(fixture_public_id, fixture_user, 2, repeat('0', 32), repeat('0', 16));
    end if;
    clock_event := public.record_employee_clock_from_scan(
      (scan ->> 'id')::uuid, fixture_user, clock_action, 'full', null,
      now() - interval '30 minutes',
      case when clock_action = 'clock_out' then now() else null end,
      now() - interval '30 minutes',
      case when clock_action = 'clock_out' then now() else null end,
      null, null,
      case when clock_action = 'clock_out' then 'closed' else 'open' end,
      'S02 fixture', null, null, null, null, null, 'S02 regression test'
    );
    if clock_event ->> 'action' <> clock_action then
      raise exception 'Server-side % recording is broken', clock_action;
    end if;
  end loop;
  reset role;
end;
$$;

select 'clock tag access checks passed' as result;
