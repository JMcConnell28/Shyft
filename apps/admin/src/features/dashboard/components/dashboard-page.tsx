"use client"

import { formatDateTime } from "@/lib/utils"
import { useDashboardQuery } from "@/features/dashboard/hooks/use-dashboard-query"

function DashboardPage() {
  const dashboardQuery = useDashboardQuery()
  const data = dashboardQuery.data

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Operational status across customers, support, errors, flags, and
          clocking.
        </p>
      </header>
      <section className="grid gap-3 md:grid-cols-5">
        <Metric label="Open errors" value={data?.summary.openErrors} />
        <Metric
          label="Support threads"
          value={data?.summary.openSupportThreads}
        />
        <Metric label="Active flags" value={data?.summary.activeFeatureFlags} />
        <Metric
          label="Clock failures today"
          value={data?.summary.failedClockAttemptsToday}
        />
        <Metric
          label="Trials ending"
          value={data?.summary.trialExpiringSoon}
        />
      </section>
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold">Recent product events</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {(data?.activity ?? []).map((item) => (
            <div className="flex items-center justify-between px-4 py-3" key={item.id}>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-slate-500">{item.type}</p>
              </div>
              <p className="text-xs text-slate-500">
                {formatDateTime(item.occurredAt)}
              </p>
            </div>
          ))}
          {data?.activity.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              No product events have been captured yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: number | undefined
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value ?? "-"}</p>
    </div>
  )
}

export { DashboardPage }
