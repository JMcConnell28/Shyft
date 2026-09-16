create index if not exists location_rota_settings_default_zone_idx
  on public.location_rota_settings (default_zone_id);

revoke all privileges on table public.location_rota_settings from anon;
revoke all privileges on table public.location_rota_settings from authenticated;
