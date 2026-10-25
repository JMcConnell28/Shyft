-- Run with BEGIN and ROLLBACK; no fixture writes may be committed.
do $$
declare
  location uuid; employee uuid; organization text; entry uuid; flag uuid;
begin
  select e.location_id,e.id,e.organization_id into location,employee,organization
  from public.employees e where e.location_id is not null limit 1;
  if location is null then raise exception 'A fixture employee and location are required'; end if;
  select id into flag from admin_private.feature_flags where key='time_clock.clock_in';
  update admin_private.feature_flags set is_enabled=true,default_value='true' where id=flag;
  delete from admin_private.feature_flag_targets where feature_flag_id=flag and location_id=location;
  if not admin_private.clock_in_feature_enabled(location) then raise exception 'All locations must inherit enabled'; end if;

  select id into entry from public.time_entries where employee_id=employee and location_id=location and clocked_out_at is null limit 1;
  if entry is null then
    insert into public.time_entries(location_id,organization_id,employee_id,source,clocked_in_at)
    values(location,organization,employee,'adjustment',now()-interval '1 hour') returning id into entry;
  end if;
  update admin_private.feature_flags set default_value='false' where id=flag;
  if admin_private.clock_in_feature_enabled(location) then raise exception 'Selected locations must default off'; end if;
  insert into admin_private.feature_flag_targets(feature_flag_id,target_type,location_id,value)
  values(flag,'location',location,'true');
  if not admin_private.clock_in_feature_enabled(location) then raise exception 'Explicit selected location must enable'; end if;
  update admin_private.feature_flags set is_enabled=false where id=flag;
  if admin_private.clock_in_feature_enabled(location) then raise exception 'Global off must beat a location enable'; end if;

  begin
    insert into public.time_entries(location_id,employee_id,source) values(location,employee,'manager_override');
    raise exception 'New clock-in incorrectly permitted';
  exception when raise_exception then
    if sqlerrm <> 'New clock-ins are currently unavailable for this location.' then raise; end if;
  end;
  update public.time_entries set clocked_out_at=greatest(now(),clocked_in_at),status='closed' where id=entry;
  if not exists(select 1 from public.time_entries where id=entry and clocked_out_at is not null) then raise exception 'Clock-out must remain possible'; end if;

  update admin_private.feature_flags set is_enabled=true,default_value='true' where id=flag;
  update admin_private.feature_flag_targets set value='false' where feature_flag_id=flag and location_id=location;
  if admin_private.clock_in_feature_enabled(location) then raise exception 'Location exclusion must override all locations'; end if;
  delete from admin_private.feature_flag_targets where feature_flag_id=flag and location_id=location;
  if not admin_private.clock_in_feature_enabled(location) then raise exception 'Removing override must restore inheritance'; end if;

  if has_table_privilege('authenticated','admin_private.feature_flags','update')
     or has_function_privilege('anon','admin_private.clock_in_feature_enabled(uuid)','execute')
  then raise exception 'Browser roles must not access flag control functions'; end if;
end $$;
select 'feature flag precedence and clock-out preservation passed' as result;
