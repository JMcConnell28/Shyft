-- Automatic closure is an estimate requiring manager approval. Preserve the
-- original clock-in source and record the system action separately.
alter table public.time_entries
  add column if not exists auto_clocked_out_at timestamptz,
  add column if not exists clock_out_reminder_sent_at timestamptz,
  add column if not exists clock_out_reminder_claimed_at timestamptz;

alter table public.clock_events drop constraint if exists clock_events_event_type_check;
alter table public.clock_events add constraint clock_events_event_type_check
  check (event_type in (
    'clock_in', 'clock_out', 'manager_clock_in', 'manager_clock_out',
    'manager_adjustment', 'auto_clock_out'
  ));

create index if not exists time_entries_open_automation_idx
  on public.time_entries ((coalesce(scheduled_end_at, clocked_in_at)), id)
  where clocked_out_at is null;

alter table public.location_clock_settings
  alter column forgotten_clock_out_alert_minutes set default 15,
  alter column hard_review_after_minutes set default 120;
update public.location_clock_settings
  set forgotten_clock_out_alert_minutes = 15, hard_review_after_minutes = 120;

comment on column public.time_entries.auto_clocked_out_at is
  'When the system closed an overdue entry. The recorded finish is estimated and requires review; clock_events retains the original estimate after manager corrections.';
