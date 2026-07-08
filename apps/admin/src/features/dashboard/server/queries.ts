import "@tanstack/react-start/server-only"

import { queryMany, queryOne } from "@rocketrota/db"

import type { DashboardActivity, DashboardData } from "@/features/dashboard/types"

type DashboardSummaryRow = {
  active_feature_flags: string | number
  failed_clock_attempts_today: string | number
  open_errors: string | number
  open_support_threads: string | number
  trial_expiring_soon: string | number
}

type ActivityRow = {
  id: string
  label: string
  occurred_at: Date | string
  type: string
}

async function getDashboardData(): Promise<DashboardData> {
  const [summary, activity] = await Promise.all([
    queryOne<DashboardSummaryRow>(
      `select
         (select count(*) from admin_private.app_error_reports where status in ('open', 'reviewing')) as open_errors,
         (select count(*) from admin_private.support_threads where status in ('open', 'waiting')) as open_support_threads,
         (select count(*) from admin_private.feature_flags where is_enabled = true) as active_feature_flags,
         (select count(*) from public.clock_attempts where success = false and created_at >= date_trunc('day', timezone('utc', now()))) as failed_clock_attempts_today,
         (select count(*) from billing_private.location_entitlements where trial_ends_at >= timezone('utc', now()) and trial_ends_at < timezone('utc', now()) + interval '7 days') as trial_expiring_soon`,
    ),
    queryMany<ActivityRow>(
      `select id::text,
              event_type as type,
              coalesce(target_type || ': ' || target_id, event_type) as label,
              created_at as occurred_at
       from admin_private.app_events
       order by created_at desc
       limit 12`,
    ),
  ])

  return {
    activity: activity.map(mapActivity),
    summary: {
      activeFeatureFlags: toCount(summary?.active_feature_flags),
      failedClockAttemptsToday: toCount(summary?.failed_clock_attempts_today),
      openErrors: toCount(summary?.open_errors),
      openSupportThreads: toCount(summary?.open_support_threads),
      trialExpiringSoon: toCount(summary?.trial_expiring_soon),
    },
  }
}

function mapActivity(row: ActivityRow): DashboardActivity {
  return {
    id: row.id,
    label: row.label,
    occurredAt: new Date(row.occurred_at).toISOString(),
    type: row.type,
  }
}

function toCount(value: number | string | null | undefined) {
  return Number(value ?? 0)
}

export { getDashboardData }
