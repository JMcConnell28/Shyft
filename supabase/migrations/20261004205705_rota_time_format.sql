alter table public.location_rota_settings
  add column time_format text not null default '12h'
  constraint location_rota_settings_time_format_check check (time_format in ('12h', '24h'));

comment on column public.location_rota_settings.time_format is
  'Display and input format for rota shift times: 12h (AM/PM) or 24h.';
