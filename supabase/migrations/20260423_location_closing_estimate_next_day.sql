alter table public.locations
  add column if not exists estimated_closing_time_next_day boolean not null default false;
