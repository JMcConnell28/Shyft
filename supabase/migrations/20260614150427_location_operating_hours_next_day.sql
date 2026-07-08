alter table public.location_operating_hours
  add column if not exists close_time_next_day boolean not null default false;
