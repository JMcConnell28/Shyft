import { useState } from "react"

import { Button } from "@/components/ui/button"
import { NewSupportRequest } from "@/features/support/components/new-support-request"
import { SupportThreadList } from "@/features/support/components/support-thread-list"
import { useSupportThreads } from "@/features/support/hooks/use-support-threads"

function CustomerSupportPage({
  organizationId,
  workspaceSlug,
}: {
  organizationId: string
  workspaceSlug: string
}) {
  const [page, setPage] = useState(0)
  const threads = useSupportThreads(organizationId, page)

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 p-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] md:p-8">
      <section className="min-w-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your conversations with RocketRota support.
          </p>
        </div>
        {threads.isPending ? (
          <p className="text-sm text-muted-foreground">Loading requests…</p>
        ) : null}
        {threads.isError ? (
          <p role="alert" className="text-sm text-destructive">
            We could not load your requests.
          </p>
        ) : null}
        {threads.data ? (
          <>
            <SupportThreadList
              threads={threads.data.threads}
              workspaceSlug={workspaceSlug}
              page={page}
            />
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={page === 0 || threads.isFetching}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page + 1}
              </span>
              <Button
                variant="outline"
                disabled={!threads.data.hasMore || threads.isFetching}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </>
        ) : null}
      </section>
      <NewSupportRequest
        organizationId={organizationId}
        workspaceSlug={workspaceSlug}
      />
    </div>
  )
}

export { CustomerSupportPage }
