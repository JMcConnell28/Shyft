# Automatic clock-out and manual times

Apply `supabase/migrations/20261018124937_automatic_clock_out.sql` and
`supabase/migrations/20261018131628_configurable_clock_out_times.sql` before deploying.
The production Nitro server runs `time-clock:process` every minute. No browser
needs to be open and no extra cron service or public endpoint is required.
Development and test builds do not schedule the task. Production must use the
existing continuously running Node server (`npm run build`, then `npm start`).

- By default, scheduled entries receive a Web Push reminder 15 minutes after their captured
  scheduled end. At two hours after that end, the entry is closed with the
  scheduled finish as an **estimate**, marked `requires_review`.
- By default, unscheduled entries receive a reminder at 7h45m and close at eight hours from
  clock-in. The eight-hour finish is an estimate requiring the same review.
- Overnight and split shifts use their captured segment end timestamps; there is
  no midnight cutoff. Jobs that run late close entries at their estimated finish,
  not the time the worker recovered. Existing overdue entries are included.
- The personal dashboard refreshes while clocked in so the timer stops after
  automatic closure. Manager views use their existing polling.
- Managers confirm or correct entries through the existing time review and
  timesheet editor. Unreviewed entries continue to block payroll exports.
- `auto_clocked_out_at` records when the system acted, and an `auto_clock_out`
  event preserves the estimate and processing timestamp after later corrections.
  The original clock-in source and notes are retained.

Settings → Clocking → Missed clock-outs provides four settings per location:
scheduled reminder delay, scheduled automatic clock-out delay, unscheduled
maximum duration, and unscheduled reminder lead time. Custom whole-minute values
save on blur or Enter. Scheduled closure must follow its reminder; the unscheduled
reminder lead must be shorter than the maximum duration. Closure limits support
up to 48 hours, and unscheduled shifts have a minimum maximum duration of one hour.
Review remains mandatory for every automatic closure.

Saved timings are used by the next background check, including for already open
entries. Shortening a limit can therefore close an existing overdue entry at the
next check. Locations without saved settings retain the defaults. Notifications
show the selected maximum rather than a fixed eight-hour message.

Push notifications require the existing VAPID configuration and an enabled
subscription on the employee's device. Recipients come from the employee's linked
user, including when a manager originally clocked them in. Successful reminders
are recorded once per entry; failed deliveries retry and abandoned claims expire
after five minutes. Delivery failures never prevent automatic closure. Stable
notification tags reduce duplicate notifications after delivery interruption.

Database row locks and conditional writes prevent duplicate closures and protect
concurrent employee clock-outs. Batches process up to 100 entries per minute;
backlogs drain on subsequent runs. Worker failures are logged by Nitro.

Manual actions remain manager-only. Both dashboard and time tracking dialogs
accept a date and time in the manager's device timezone, defaulting to now. The
server rejects future times, clock-outs before clock-in, and clock-ins overlapping
later entries at the same location. Shift matching uses the chosen instant.
Clock events store the effective time separately from their creation timestamp
and retain the authenticated manager and mandatory reason.
