"use client"

import { Link } from "@tanstack/react-router"
import { ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useDashboardQuery } from "@/features/dashboard/hooks/use-dashboard-query"
import { formatDateTime } from "@/lib/utils"

function DashboardPage() {
  const query = useDashboardQuery()
  const { data } = query
  const needsReconciliation = data?.summary.billingReconciliationNeedsAttention
  const paymentReviews = data?.summary.openPaymentReviews ?? 0

  return (
    <div className="mx-auto w-full max-w-[96rem] space-y-4">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Dashboard
      </h1>
      {query.isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          Dashboard could not refresh.
          <Button
            variant="secondary"
            className="h-11 md:h-9"
            onClick={() => void query.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}
      {needsReconciliation || paymentReviews > 0 ? (
        <div className="divide-y divide-amber-200 rounded-lg border border-amber-200 bg-amber-50">
          {needsReconciliation ? (
            <BillingNotice label="Billing reconciliation needs attention" />
          ) : null}
          {paymentReviews > 0 ? (
            <BillingNotice
              label={`${paymentReviews} payment ${paymentReviews === 1 ? "review" : "reviews"} before dispatch`}
            />
          ) : null}
        </div>
      ) : null}
      <dl
        aria-label="Operational counts"
        aria-busy={query.isPending}
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 lg:grid-cols-5"
      >
        <Metric
          label="Open errors"
          value={data?.summary.openErrors}
          pending={query.isPending}
        />
        <Metric
          label="Support threads"
          value={data?.summary.openSupportThreads}
          pending={query.isPending}
        />
        <Metric
          label="Active flags"
          value={data?.summary.activeFeatureFlags}
          pending={query.isPending}
        />
        <Metric
          label="Clock failures today"
          value={data?.summary.failedClockAttemptsToday}
          pending={query.isPending}
        />
        <Metric
          label="Trials ending"
          value={data?.summary.trialExpiringSoon}
          pending={query.isPending}
        />
      </dl>
      <section
        aria-labelledby="product-events-heading"
        aria-busy={query.isPending}
        className="rounded-xl border border-slate-200 bg-white"
      >
        <h2
          id="product-events-heading"
          className="border-b border-slate-200 px-4 py-3 text-sm font-semibold"
        >
          Recent product events
        </h2>
        {data?.activity.length ? (
          <ul className="divide-y divide-slate-100">
            {data.activity.map((item) => (
              <li
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 py-2.5"
                key={item.id}
              >
                <span className="min-w-0 text-sm wrap-anywhere">
                  <span className="font-medium">{item.type}</span>
                  {item.label !== item.type ? (
                    <span className="text-slate-600">
                      {" · "}
                      {item.label}
                    </span>
                  ) : null}
                </span>
                <time
                  dateTime={item.occurredAt}
                  className="shrink-0 text-xs text-slate-600 tabular-nums"
                >
                  {formatDateTime(item.occurredAt)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="px-4 py-3 text-sm text-slate-600"
            role={query.isPending ? "status" : undefined}
          >
            {query.isPending
              ? "Loading events…"
              : data
                ? "No product events yet."
                : "Events unavailable."}
          </p>
        )}
      </section>
    </div>
  )
}

function BillingNotice({ label }: { label: string }) {
  return (
    <Link
      to="/billing"
      className="flex min-h-11 items-center justify-between gap-3 px-3 py-2 text-sm font-medium text-amber-950 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-amber-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
    >
      {label}
      <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0" />
    </Link>
  )
}

function Metric({
  label,
  value,
  pending,
}: {
  label: string
  value: number | undefined
  pending: boolean
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-2 bg-white px-3 py-2 last:col-span-2 sm:px-4 lg:last:col-span-1">
      <dt className="text-xs font-medium text-slate-600">{label}</dt>
      <dd className="text-base font-semibold tabular-nums">
        {pending ? (
          <span
            aria-hidden="true"
            className="block h-4 w-6 rounded bg-slate-100"
          />
        ) : (
          (value ?? "—")
        )}
      </dd>
    </div>
  )
}

export { DashboardPage }
