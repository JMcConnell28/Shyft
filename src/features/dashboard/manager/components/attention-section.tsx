import { Link } from "@tanstack/react-router"
import { formatAttentionDate } from "../utils/date"
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
  const now = new Date(data?.updatedAt ?? Date.now())
  return (
    <section
      id="dashboard-attention"
      aria-labelledby="attention-heading"
      className="scroll-mt-4 rounded-xl border border-[#e0e6f1] bg-white"
    >
      <div className="border-b border-[#edf0f6] p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="attention-heading" className="text-sm font-bold">
            Needs attention
          </h2>
          <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-bold text-orange-800">
            {data?.total ?? "—"}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-[#7481a0]">
          All permitted locations · unresolved across all dates
        </p>
      </div>
      {error ? (
        <div role="alert" className="p-4 text-xs text-[#7481a0]">
          Could not refresh outstanding items.{" "}
          <Button variant="link" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
      {!data && pending ? (
        <div role="status" className="p-6 text-xs text-[#7481a0]">
          Loading outstanding items…
        </div>
      ) : null}
      {data?.total === 0 ? (
        <p className="p-6 text-center text-xs text-[#7481a0]">
          Nothing needs attention.
        </p>
      ) : null}
      <ul className="divide-y divide-[#edf0f6]">
        {data?.items.map((item) => (
          <li key={`${item.kind}:${item.id}`} className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold">{item.employeeName}</p>
                <p className="mt-0.5 text-[10px] text-[#7481a0]">
                  {item.locationName}
                </p>
              </div>
              {item.kind === "swap" || item.kind === "cover" ? (
                <Button
                  nativeButton={false}
                  variant="outline"
                  className="h-8 rounded-lg"
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
                  className="h-8 rounded-lg"
                  onClick={() => onReview(item)}
                >
                  {item.kind === "arrival" ? "Resolve" : "Review"}
                </Button>
              )}
            </div>
            <p className="text-[11px] leading-relaxed wrap-anywhere whitespace-pre-wrap text-[#46577d]">
              {item.reason}
            </p>
            <p className="text-[10px] font-semibold text-[#7481a0]">
              <time dateTime={item.occurredAt}>
                {formatAttentionDate(item.occurredAt, item.timeZone, now)}
              </time>
            </p>
          </li>
        ))}
      </ul>
      {data && data.total > data.pageSize ? (
        <div className="flex items-center justify-between gap-2 border-t border-[#edf0f6] p-3 text-[11px] text-[#7481a0]">
          <Button
            variant="outline"
            disabled={data.page === 1 || pending}
            onClick={() => onPage(data.page - 1)}
          >
            Previous
          </Button>
          <span>
            {(data.page - 1) * data.pageSize + 1}–
            {Math.min(data.page * data.pageSize, data.total)} of {data.total}
          </span>
          <Button
            variant="outline"
            disabled={data.page * data.pageSize >= data.total || pending}
            onClick={() => onPage(data.page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </section>
  )
}
export { ManagerAttentionSection }
