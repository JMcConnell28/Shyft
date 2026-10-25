alter table admin_private.feature_flags add column revision integer not null default 0;
insert into admin_private.feature_flags(key,name,description,is_enabled,default_value) values
 ('rota.templates','Rota templates','Create, update and apply saved rota templates.',true,'true'),
 ('rota.publishing','Rota publishing','Publish, republish and unpublish rotas.',true,'true'),
 ('shift_swaps','Shift swaps','Shift swap and cover requests at enabled locations.',true,'true'),
 ('time_clock.clock_in','New clock-ins','New employee and manager clock-ins. Clock-out remains available.',true,'true'),
 ('station_purchases','Extra station purchases','Checkout for additional physical stations.',true,'true')
on conflict(key) do nothing;

-- Private invoker function: browser roles cannot read or edit flag configuration.
create function admin_private.clock_in_feature_enabled(p_location_id uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
 select coalesce((select case when not f.is_enabled then false
   when jsonb_typeof(t.value) = 'boolean' then t.value = 'true'::jsonb
   when jsonb_typeof(f.default_value) = 'boolean' then f.default_value = 'true'::jsonb
   else true end
 from admin_private.feature_flags f
 left join admin_private.feature_flag_targets t on t.feature_flag_id = f.id
   and t.target_type = 'location' and t.location_id = p_location_id
 where f.key = 'time_clock.clock_in'), true)
$$;
revoke all on function admin_private.clock_in_feature_enabled(uuid) from public, anon, authenticated;
grant execute on function admin_private.clock_in_feature_enabled(uuid) to service_role;

create function admin_private.enforce_new_clock_in_flag()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if not admin_private.clock_in_feature_enabled(new.location_id) then
   raise exception 'New clock-ins are currently unavailable for this location.';
 end if;
 return new;
end $$;
revoke all on function admin_private.enforce_new_clock_in_flag() from public, anon, authenticated;
grant execute on function admin_private.enforce_new_clock_in_flag() to service_role;
create trigger enforce_new_clock_in_flag before insert on public.time_entries
for each row when (new.clocked_out_at is null) execute function admin_private.enforce_new_clock_in_flag();
