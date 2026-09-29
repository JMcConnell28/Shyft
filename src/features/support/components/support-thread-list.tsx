import { Link } from "@tanstack/react-router"
import { ArrowUpRightIcon, LifeBuoyIcon } from "lucide-react"

import type { SupportThreadSummary } from "@/features/support/types"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

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
      <Empty className="min-h-56 border-0 px-5 py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LifeBuoyIcon />
          </EmptyMedia>
          <EmptyTitle>
            {page === 0 ? "No support requests yet" : "No more requests"}
          </EmptyTitle>
          <EmptyDescription>
            {page === 0
              ? "Questions, issues, and suggestions you send will appear here."
              : "Go back to see your earlier requests."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ul className="divide-y divide-[#e7ebf3]">
      {threads.map((thread) => (
        <li key={thread.id}>
          <Link
            to="/app/$workspaceSlug/support/$threadId"
            params={{ workspaceSlug, threadId: thread.id }}
            className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[#fbfcff] focus-visible:outline-2 focus-visible:outline-[#0968f5] sm:px-5"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                {thread.unread ? (
                  <span
                    className="size-2 shrink-0 rounded-full bg-[#0968f5]"
                    aria-label="Unread"
                  />
                ) : null}
                <span className="truncate text-sm font-bold text-[#10204b] sm:text-base">
                  {thread.subject}
                </span>
              </span>
              <span className="mt-1 block text-xs text-[#7180a2]">
                {categoryLabels[thread.category]} · {thread.status} ·{" "}
                {new Date(thread.updatedAt).toLocaleString()}
              </span>
            </span>
            <ArrowUpRightIcon
              className="size-4 shrink-0 text-[#0968f5]"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export { SupportThreadList, categoryLabels }
