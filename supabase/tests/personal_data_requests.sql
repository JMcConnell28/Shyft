-- Run only inside a transaction; fixtures must never be committed.
begin;
do $$
declare
  subject_id text := 'privacy-rollback-' || gen_random_uuid()::text;
  request_id uuid;
  repeat_count integer;
begin
  if has_schema_privilege('anon', 'privacy_private', 'usage')
    or has_schema_privilege('authenticated', 'privacy_private', 'usage') then
    raise exception 'Browser roles must not access the privacy schema';
  end if;
  if has_table_privilege('anon', 'privacy_private.data_requests', 'select')
    or has_table_privilege('authenticated', 'privacy_private.data_request_events', 'select') then
    raise exception 'Browser roles must not access privacy records';
  end if;
  insert into public."user"(id,name,email,"emailVerified","createdAt","updatedAt")
    values(subject_id,'Privacy rollback fixture',subject_id || '@example.com',true,now(),now());
  insert into privacy_private.data_requests(user_id,subject_name,subject_email)
    values(subject_id,'Privacy rollback fixture',subject_id || '@example.com') returning id into request_id;
  begin
    insert into privacy_private.data_requests(user_id,subject_name,subject_email)
      values(subject_id,'Privacy rollback fixture',subject_id || '@example.com');
    raise exception 'Duplicate pending requests were accepted';
  exception when unique_violation then null;
  end;
  begin
    update privacy_private.data_requests set status = 'ready' where id = request_id;
    raise exception 'Ready response without a payload was accepted';
  exception when check_violation then null;
  end;
  update privacy_private.data_requests set status = 'completed' where id = request_id;
  insert into privacy_private.data_requests(user_id,subject_name,subject_email)
    values(subject_id,'Privacy rollback fixture',subject_id || '@example.com');
  select count(*) into repeat_count from privacy_private.data_requests where user_id = subject_id;
  if repeat_count <> 2 then raise exception 'A later request could not be recorded'; end if;
end $$;
rollback;
