alter table public.locations
  add column if not exists estimated_closing_time time not null default '23:00';
