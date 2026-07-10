alter table public.location_clock_settings
add column if not exists early_clock_in_grace_minutes integer not null default 10
  check (early_clock_in_grace_minutes between 0 and 120),
add column if not exists late_clock_out_grace_minutes integer not null default 10
  check (late_clock_out_grace_minutes between 0 and 120),
add column if not exists early_start_review_minutes integer not null default 15
  check (early_start_review_minutes between 0 and 240),
add column if not exists late_finish_review_minutes integer not null default 15
  check (late_finish_review_minutes between 0 and 240),
add column if not exists forgotten_clock_out_alert_minutes integer not null default 120
  check (forgotten_clock_out_alert_minutes between 15 and 1440),
add column if not exists hard_review_after_minutes integer not null default 720
  check (hard_review_after_minutes between 60 and 2880);

alter table public.time_entries
add column if not exists scheduled_start_at timestamptz,
add column if not exists scheduled_end_at timestamptz,
add column if not exists payable_start_at timestamptz,
add column if not exists payable_end_at timestamptz;

create index if not exists time_entries_review_status_lookup_idx
on public.time_entries (location_id, status, clocked_in_at desc);

create index if not exists time_entries_open_scheduled_end_lookup_idx
on public.time_entries (location_id, scheduled_end_at)
where clocked_out_at is null;
