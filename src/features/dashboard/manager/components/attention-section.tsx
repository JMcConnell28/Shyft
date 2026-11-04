import { Link } from "@tanstack/react-router"
import { formatAttentionDate } from "../utils/date"
import type { AttentionItem, AttentionPage } from "../types"
import { Button } from "@/components/ui/button"
import {
  DashboardPanel,
  DashboardPanelHeader,
} from "@/features/dashboard/components/dashboard-layout"

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
    <DashboardPanel
      id="dashboard-attention"
      aria-labelledby="attention-heading"
      aria-describedby="attention-scope"
      tabIndex={-1}
      className="scroll-mt-4 xl:col-start-2 xl:row-start-1"
    >
      <span id="attention-scope" className="sr-only">
        All locations and dates
      </span>
      <DashboardPanelHeader
        headingId="attention-heading"
        title="Needs attention"
        action={
          data && data.total > 1 ? (
            <AttentionPager data={data} pending={pending} onPage={onPage} />
          ) : (
            <span className="text-xs text-muted-foreground">All locations</span>
          )
        }
      />
      {error ? (
        <div
          role="alert"
          className="border-t px-4 py-2 text-sm text-muted-foreground"
        >
          Could not refresh outstanding items.{" "}
          <Button variant="link" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
      {!data && pending ? (
        <div
          role="status"
          className="border-t px-4 py-3 text-sm text-muted-foreground"
        >
          Loading outstanding items…
        </div>
      ) : null}
      {data?.total === 0 ? (
        <p className="border-t px-4 py-3 text-sm text-muted-foreground">
          Nothing needs attention.
        </p>
      ) : null}
      <ul>
        {data?.items.slice(0, 1).map((item) => (
          <li
            key={`${item.kind}:${item.id}`}
            className="space-y-1.5 border-t px-3.5 py-3 sm:px-4"
          >
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
                  variant="outline"
                  className="h-11 shrink-0 rounded-lg text-sm sm:h-10 md:h-8 md:text-xs"
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
                  variant="outline"
                  className="h-11 shrink-0 rounded-lg text-sm sm:h-10 md:h-8 md:text-xs"
                  onClick={() => onReview(item)}
                >
                  {item.kind === "arrival" ? "Resolve" : "Review"}
                </Button>
              )}
            </div>
            <p
              title={item.reason}
              className="line-clamp-3 text-sm wrap-anywhere whitespace-pre-wrap text-muted-foreground"
            >
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
    </DashboardPanel>
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
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Button
        variant="ghost"
        className="h-11 min-w-11 rounded-lg px-1.5 text-xs md:h-8"
        aria-label="Newer attention item"
        disabled={data.page === 1 || pending}
        onClick={() => onPage(data.page - 1)}
      >
        Newer
      </Button>
      <span role="status" className="whitespace-nowrap tabular-nums">
        {data.page} of {data.total}
      </span>
      <Button
        variant="ghost"
        className="h-11 min-w-11 rounded-lg px-1.5 text-xs md:h-8"
        aria-label="Older attention item"
        disabled={data.page * data.pageSize >= data.total || pending}
        onClick={() => onPage(data.page + 1)}
      >
        Older
      </Button>
    </div>
  )
}
export { ManagerAttentionSection }
