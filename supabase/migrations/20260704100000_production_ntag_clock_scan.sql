alter table public.clock_tags
  drop constraint if exists clock_tags_ntag_public_id_format_check;

update public.clock_tags
   set ntag_public_id = null,
       ntag_aes_key_hex = null,
       ntag_last_seen_counter = 0,
       is_active = false,
       disabled_at = coalesce(disabled_at, timezone('utc', now())),
       updated_at = timezone('utc', now())
 where ntag_public_id is not null
   and ntag_public_id !~ '^clk_[0-9A-F]{32}$';

alter table public.clock_tags
  add constraint clock_tags_ntag_public_id_format_check
  check (
    ntag_public_id is null
    or ntag_public_id ~ '^clk_[0-9A-F]{32}$'
  );

alter table public.location_clock_settings
  add column if not exists late_clock_in_grace_minutes integer not null default 5
    check (late_clock_in_grace_minutes between 0 and 120),
  add column if not exists late_start_review_minutes integer not null default 15
    check (late_start_review_minutes between 0 and 240);

create table if not exists public.clock_scan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  organization_id text references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  clock_tag_id uuid not null references public.clock_tags(id) on delete cascade,
  picc_counter integer not null check (picc_counter >= 0),
  action text not null check (action in ('clock_in', 'clock_out')),
  encrypted_picc_hex text not null check (encrypted_picc_hex ~ '^[0-9A-F]{32}$'),
  cmac_hex text not null check (cmac_hex ~ '^[0-9A-F]{16}$'),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists clock_scan_sessions_user_lookup_idx
  on public.clock_scan_sessions (user_id, expires_at desc);

create index if not exists clock_scan_sessions_tag_counter_idx
  on public.clock_scan_sessions (clock_tag_id, picc_counter);

alter table public.clock_scan_sessions enable row level security;

drop policy if exists "clock_scan_sessions_select_manager" on public.clock_scan_sessions;
create policy "clock_scan_sessions_select_manager"
on public.clock_scan_sessions
for select
to public
using (public.has_location_role(location_id, array['owner', 'admin', 'manager', 'supervisor']));

create or replace function public.claim_clock_scan_session(
  p_tag_public_id text,
  p_user_id text,
  p_picc_counter integer,
  p_encrypted_picc_hex text,
  p_cmac_hex text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tag record;
  v_employee record;
  v_claim_id uuid;
  v_open_count integer;
  v_action text;
  v_session record;
begin
  select tag.id,
         tag.organization_id,
         tag.location_id
    into v_tag
    from public.clock_tags tag
   where tag.ntag_public_id = p_tag_public_id
     and tag.is_active = true
     and tag.disabled_at is null
     and tag.ntag_aes_key_hex is not null
   limit 1;

  if v_tag.id is null then
    raise exception 'clock_tag_inactive';
  end if;

  select employee.id,
         employee.full_name
    into v_employee
    from public.employees employee
    join public.employee_location_assignments assignment
      on assignment.employee_id = employee.id
   where employee.user_id = p_user_id
     and employee.status = 'active'
     and assignment.location_id = v_tag.location_id
     and assignment.is_enabled = true
     and assignment.disabled_at is null
   limit 1;

  if v_employee.id is null then
    raise exception 'employee_not_assigned';
  end if;

  insert into public.clock_tag_counter_claims (
    clock_tag_id,
    picc_counter,
    encrypted_picc_hex,
    cmac_hex
  )
  values (
    v_tag.id,
    p_picc_counter,
    p_encrypted_picc_hex,
    p_cmac_hex
  )
  on conflict (clock_tag_id, picc_counter) do nothing
  returning id into v_claim_id;

  if v_claim_id is null then
    raise exception 'counter_already_used';
  end if;

  update public.clock_tags
     set ntag_last_seen_counter = greatest(ntag_last_seen_counter, p_picc_counter),
         updated_at = timezone('utc', now())
   where id = v_tag.id;

  select count(*)::integer
    into v_open_count
    from public.time_entries entry
   where entry.employee_id = v_employee.id
     and entry.location_id = v_tag.location_id
     and entry.clocked_out_at is null;

  if v_open_count > 1 then
    raise exception 'multiple_open_entries';
  end if;

  v_action := case when v_open_count = 1 then 'clock_out' else 'clock_in' end;

  insert into public.clock_scan_sessions (
    user_id,
    employee_id,
    organization_id,
    location_id,
    clock_tag_id,
    picc_counter,
    action,
    encrypted_picc_hex,
    cmac_hex,
    expires_at
  )
  values (
    p_user_id,
    v_employee.id,
    v_tag.organization_id,
    v_tag.location_id,
    v_tag.id,
    p_picc_counter,
    v_action,
    p_encrypted_picc_hex,
    p_cmac_hex,
    timezone('utc', now()) + interval '2 minutes'
  )
  returning * into v_session;

  return jsonb_build_object(
    'id', v_session.id,
    'userId', v_session.user_id,
    'employeeId', v_session.employee_id,
    'organizationId', v_session.organization_id,
    'locationId', v_session.location_id,
    'clockTagId', v_session.clock_tag_id,
    'piccCounter', v_session.picc_counter,
    'action', v_session.action,
    'expiresAt', v_session.expires_at
  );
end;
$$;

create or replace function public.record_employee_clock_from_scan(
  p_scan_session_id uuid,
  p_user_id text,
  p_action text,
  p_shift_segment text,
  p_rota_published_shift_id uuid,
  p_clocked_in_at timestamptz,
  p_clocked_out_at timestamptz,
  p_payable_start_at timestamptz,
  p_payable_end_at timestamptz,
  p_scheduled_start_at timestamptz,
  p_scheduled_end_at timestamptz,
  p_status text,
  p_notes text,
  p_gps_latitude double precision,
  p_gps_longitude double precision,
  p_gps_accuracy_meters double precision,
  p_gps_distance_meters double precision,
  p_ip_hash text,
  p_user_agent text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session record;
  v_existing record;
  v_open_count integer;
  v_entry record;
begin
  select *
    into v_session
    from public.clock_scan_sessions
   where id = p_scan_session_id
     and user_id = p_user_id
   for update;

  if v_session.id is null then
    raise exception 'scan_session_not_found';
  end if;

  if v_session.consumed_at is not null then
    raise exception 'scan_session_consumed';
  end if;

  if v_session.expires_at < timezone('utc', now()) then
    raise exception 'scan_session_expired';
  end if;

  if v_session.action <> p_action then
    raise exception 'scan_session_action_mismatch';
  end if;

  if p_action = 'clock_in' then
    select count(*)::integer
      into v_open_count
      from public.time_entries
     where employee_id = v_session.employee_id
       and location_id = v_session.location_id
       and clocked_out_at is null;

    if v_open_count > 0 then
      raise exception 'already_clocked_in';
    end if;

    insert into public.time_entries (
      organization_id,
      location_id,
      employee_id,
      user_id,
      rota_published_shift_id,
      shift_segment,
      scheduled_start_at,
      scheduled_end_at,
      clocked_in_at,
      payable_start_at,
      status,
      source,
      notes,
      created_by,
      updated_by
    )
    values (
      v_session.organization_id,
      v_session.location_id,
      v_session.employee_id,
      p_user_id,
      p_rota_published_shift_id,
      p_shift_segment,
      p_scheduled_start_at,
      p_scheduled_end_at,
      p_clocked_in_at,
      p_payable_start_at,
      p_status,
      'employee_nfc',
      p_notes,
      p_user_id,
      p_user_id
    )
    returning * into v_entry;

    insert into public.clock_events (
      time_entry_id,
      organization_id,
      location_id,
      employee_id,
      performed_by_user_id,
      event_type,
      reason
    )
    values (
      v_entry.id,
      v_entry.organization_id,
      v_entry.location_id,
      v_entry.employee_id,
      p_user_id,
      'clock_in',
      p_notes
    );
  else
    select count(*)::integer
      into v_open_count
      from public.time_entries
     where employee_id = v_session.employee_id
       and location_id = v_session.location_id
       and clocked_out_at is null;

    if v_open_count <> 1 then
      raise exception 'open_entry_mismatch';
    end if;

    select *
      into v_existing
      from public.time_entries
     where employee_id = v_session.employee_id
       and location_id = v_session.location_id
       and clocked_out_at is null
     for update;

    update public.time_entries
       set clocked_out_at = p_clocked_out_at,
           payable_end_at = p_payable_end_at,
           status = case
             when v_existing.status = 'requires_review' or p_status = 'requires_review'
             then 'requires_review'
             else 'closed'
           end,
           notes = case
             when p_notes is null or p_notes = '' then notes
             when notes is null or notes = '' then p_notes
             else notes || E'\n' || p_notes
           end,
           updated_by = p_user_id,
           updated_at = timezone('utc', now())
     where id = v_existing.id
     returning * into v_entry;

    insert into public.clock_events (
      time_entry_id,
      organization_id,
      location_id,
      employee_id,
      performed_by_user_id,
      event_type,
      reason
    )
    values (
      v_entry.id,
      v_entry.organization_id,
      v_entry.location_id,
      v_entry.employee_id,
      p_user_id,
      'clock_out',
      p_notes
    );
  end if;

  update public.clock_scan_sessions
     set consumed_at = timezone('utc', now())
   where id = v_session.id;

  insert into public.clock_attempts (
    organization_id,
    location_id,
    clock_tag_id,
    employee_id,
    performed_by_user_id,
    action,
    success,
    failure_reason,
    gps_latitude,
    gps_longitude,
    gps_accuracy_meters,
    gps_distance_meters,
    ip_hash,
    user_agent
  )
  values (
    v_session.organization_id,
    v_session.location_id,
    v_session.clock_tag_id,
    v_session.employee_id,
    p_user_id,
    p_action,
    true,
    null,
    p_gps_latitude,
    p_gps_longitude,
    p_gps_accuracy_meters,
    p_gps_distance_meters,
    p_ip_hash,
    p_user_agent
  );

  return jsonb_build_object(
    'id', v_entry.id,
    'action', p_action,
    'status', v_entry.status,
    'clockedInAt', v_entry.clocked_in_at,
    'clockedOutAt', v_entry.clocked_out_at
  );
end;
$$;

create or replace function public.approve_time_entry_as_recorded(
  p_entry_id uuid,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry record;
  v_has_permission boolean;
  v_next_status text;
begin
  select *
    into v_entry
    from public.time_entries
   where id = p_entry_id
   for update;

  if v_entry.id is null then
    raise exception 'time_entry_not_found';
  end if;

  select exists (
    select 1
      from public.location_memberships membership
     where membership.location_id = v_entry.location_id
       and membership.user_id = p_user_id
       and membership.role = any(array['owner', 'admin', 'manager', 'supervisor'])
    union
    select 1
      from public.member member
     where member."organizationId" = v_entry.organization_id
       and member."userId" = p_user_id
       and member.role = any(array['owner', 'admin', 'manager', 'supervisor'])
  ) into v_has_permission;

  if not v_has_permission then
    raise exception 'time_entry_approval_forbidden';
  end if;

  if v_entry.status <> 'requires_review' then
    raise exception 'time_entry_not_in_review';
  end if;

  v_next_status := case when v_entry.clocked_out_at is null then 'open' else 'closed' end;

  update public.time_entries
     set status = v_next_status,
         notes = case
           when notes is null or notes = '' then 'Manager approved as recorded.'
           else notes || E'\nManager approved as recorded.'
         end,
         updated_by = p_user_id,
         updated_at = timezone('utc', now())
   where id = v_entry.id
   returning * into v_entry;

  insert into public.clock_events (
    time_entry_id,
    organization_id,
    location_id,
    employee_id,
    performed_by_user_id,
    event_type,
    reason
  )
  values (
    v_entry.id,
    v_entry.organization_id,
    v_entry.location_id,
    v_entry.employee_id,
    p_user_id,
    'manager_adjustment',
    'Manager approved as recorded.'
  );

  return jsonb_build_object(
    'id', v_entry.id,
    'status', v_entry.status
  );
end;
$$;

revoke execute on function public.claim_clock_scan_session(text, text, integer, text, text) from public, anon, authenticated;
revoke execute on function public.record_employee_clock_from_scan(uuid, text, text, text, uuid, timestamptz, timestamptz, timestamptz, timestamptz, timestamptz, timestamptz, text, text, double precision, double precision, double precision, double precision, text, text) from public, anon, authenticated;
revoke execute on function public.approve_time_entry_as_recorded(uuid, text) from public, anon, authenticated;

grant execute on function public.claim_clock_scan_session(text, text, integer, text, text) to service_role;
grant execute on function public.record_employee_clock_from_scan(uuid, text, text, text, uuid, timestamptz, timestamptz, timestamptz, timestamptz, timestamptz, timestamptz, text, text, double precision, double precision, double precision, double precision, text, text) to service_role;
grant execute on function public.approve_time_entry_as_recorded(uuid, text) to service_role;
