import { Link } from "@tanstack/react-router"

import type { SupportThreadSummary } from "@/features/support/types"

const categoryLabels = {
  support: "Question",
  bug: "Issue",
  feature_request: "Suggestion",
} as const

function SupportThreadList({
  threads,
  workspaceSlug,
  page,
}: {
  threads: Array<SupportThreadSummary>
  workspaceSlug: string
  page: number
}) {
  if (threads.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        {page === 0
          ? "No support requests yet. Send your first question, issue, or suggestion."
          : "No more support requests."}
      </p>
    )
  }

  return (
    <ul className="divide-y rounded-xl border bg-background">
      {threads.map((thread) => (
        <li key={thread.id}>
          <Link
            to="/app/$workspaceSlug/support/$threadId"
            params={{ workspaceSlug, threadId: thread.id }}
            className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                {thread.unread ? (
                  <span
                    className="size-2 rounded-full bg-primary"
                    aria-label="Unread"
                  />
                ) : null}
                <span className="truncate font-semibold">{thread.subject}</span>
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {categoryLabels[thread.category]} · {thread.status} ·{" "}
                {new Date(thread.updatedAt).toLocaleString()}
              </span>
            </span>
            <span className="text-sm font-medium text-primary">Open</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export { SupportThreadList, categoryLabels }
