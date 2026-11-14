import { Link } from "@tanstack/react-router"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { formatAttentionDate } from "../utils/date"
import { ManagerDashboardCard } from "./dashboard-card"
import type { AttentionItem, AttentionPage } from "../types"
import { Button } from "@/components/ui/button"

function ManagerAttentionSection({
  data,
  error,
  pending,
  workspaceSlug,
  onPage,
  onReview,
  onRetry,
}: {
  data: AttentionPage | undefined
  error: boolean
  pending: boolean
  workspaceSlug: string
  onPage: (page: number) => void
  onReview: (item: AttentionItem) => void
  onRetry: () => void
}) {
  return (
    <ManagerDashboardCard
      id="dashboard-attention"
      headingId="attention-heading"
      title="Needs attention"
      description="All locations and dates"
      descriptionId="attention-scope"
      tabIndex={-1}
      className="scroll-mt-4"
      action={
        data ? (
          <span className="rounded-md bg-card px-2 py-0.5 text-xs font-medium tabular-nums">
            {data.total}
          </span>
        ) : null
      }
    >
      {error ? (
        <div role="alert" className="px-4 py-3 text-sm text-muted-foreground">
          Could not refresh outstanding items.{" "}
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
      {!data && pending ? (
        <div
          role="status"
          className="px-4 py-4 text-sm leading-6 text-muted-foreground"
        >
          Loading outstanding items…
        </div>
      ) : null}
      {data?.total === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">
          Nothing needs attention.
        </p>
      ) : null}
      <ul>
        {data?.items.slice(0, 1).map((item) => (
          <li key={`${item.kind}:${item.id}`} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.employeeName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.locationName}
                </p>
              </div>
              {item.kind === "swap" || item.kind === "cover" ? (
                <Button
                  nativeButton={false}
                  variant="secondary"
                  className={`shrink-0`}
                  render={
                    <Link
                      to="/app/$workspaceSlug/shift-swaps"
                      params={{ workspaceSlug }}
                    />
                  }
                >
                  Review
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className={`shrink-0`}
                  onClick={() => onReview(item)}
                >
                  {item.kind === "arrival" ? "Resolve" : "Review"}
                </Button>
              )}
            </div>
            <p className="text-sm leading-5 wrap-anywhere whitespace-pre-wrap text-muted-foreground">
              {item.reason}
            </p>
            <p className="text-xs text-muted-foreground">
              <time dateTime={item.occurredAt}>
                {formatAttentionDate(
                  item.occurredAt,
                  item.timeZone,
                  new Date(data.updatedAt)
                )}
              </time>
            </p>
          </li>
        ))}
      </ul>
      {data && data.total > 1 ? (
        <AttentionPager data={data} pending={pending} onPage={onPage} />
      ) : null}
    </ManagerDashboardCard>
  )
}

function AttentionPager({
  data,
  pending,
  onPage,
}: {
  data: AttentionPage
  pending: boolean
  onPage: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
      <Button
        variant="secondary"
        aria-label="Newer attention item"
        disabled={data.page === 1 || pending}
        onClick={() => onPage(data.page - 1)}
      >
        <ChevronLeftIcon aria-hidden="true" />
        Newer
      </Button>
      <span role="status" className="whitespace-nowrap tabular-nums">
        {data.page} of {data.total}
      </span>
      <Button
        variant="secondary"
        aria-label="Older attention item"
        disabled={data.page * data.pageSize >= data.total || pending}
        onClick={() => onPage(data.page + 1)}
      >
        Older
        <ChevronRightIcon aria-hidden="true" />
      </Button>
    </div>
  )
}
export { ManagerAttentionSection }
