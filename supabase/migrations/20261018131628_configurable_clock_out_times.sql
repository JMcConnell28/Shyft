alter table public.location_clock_settings
  add column if not exists unscheduled_clock_out_after_minutes integer not null default 480
    check (unscheduled_clock_out_after_minutes between 60 and 2880),
  add column if not exists unscheduled_clock_out_reminder_minutes integer not null default 15
    check (unscheduled_clock_out_reminder_minutes between 1 and 1440);

alter table public.location_clock_settings
  drop constraint if exists location_clock_settings_forgotten_clock_out_alert_minutes_check,
  drop constraint if exists location_clock_settings_hard_review_after_minutes_check;

-- Preserve saved values; repair an old reminder at or after its cutoff.
update public.location_clock_settings
  set hard_review_after_minutes = forgotten_clock_out_alert_minutes + 1
  where hard_review_after_minutes <= forgotten_clock_out_alert_minutes;

alter table public.location_clock_settings
  add constraint location_clock_settings_forgotten_clock_out_alert_minutes_check
    check (forgotten_clock_out_alert_minutes between 1 and 1440),
  add constraint location_clock_settings_hard_review_after_minutes_check
    check (hard_review_after_minutes between 2 and 2880),
  add constraint location_clock_settings_scheduled_reminder_before_close_check
    check (forgotten_clock_out_alert_minutes < hard_review_after_minutes),
  add constraint location_clock_settings_unscheduled_reminder_before_close_check
    check (unscheduled_clock_out_reminder_minutes < unscheduled_clock_out_after_minutes);
