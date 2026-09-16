drop policy if exists "location_rota_settings_manage_manager"
  on public.location_rota_settings;

drop policy if exists "location_rota_settings_insert_manager"
  on public.location_rota_settings;

create policy "location_rota_settings_insert_manager"
on public.location_rota_settings
for insert
to public
with check (
  public.has_location_role(location_id, array['owner', 'admin', 'manager'])
);

drop policy if exists "location_rota_settings_update_manager"
  on public.location_rota_settings;

create policy "location_rota_settings_update_manager"
on public.location_rota_settings
for update
to public
using (
  public.has_location_role(location_id, array['owner', 'admin', 'manager'])
)
with check (
  public.has_location_role(location_id, array['owner', 'admin', 'manager'])
);

drop policy if exists "location_rota_settings_delete_manager"
  on public.location_rota_settings;

create policy "location_rota_settings_delete_manager"
on public.location_rota_settings
for delete
to public
using (
  public.has_location_role(location_id, array['owner', 'admin', 'manager'])
);
