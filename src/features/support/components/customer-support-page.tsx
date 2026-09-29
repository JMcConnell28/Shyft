import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  const [isCreating, setIsCreating] = useState(false)
  const threads = useSupportThreads(organizationId, page)

  return (
    <main className="flex flex-1 bg-[#f6f8fc] px-4 py-5 pb-[max(2rem,env(safe-area-inset-bottom))] text-[#10204b] sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[1.75rem] leading-none font-extrabold tracking-[-0.045em] sm:text-3xl">
              Support
            </h1>
            <p className="mt-2 text-sm font-medium text-[#61709a]">
              Your conversations with RocketRota support.
            </p>
          </div>
          <Button
            type="button"
            className="h-10 w-full rounded-lg bg-[#0867f2] px-4 font-semibold text-white hover:bg-[#075edc] sm:w-auto"
            onClick={() => setIsCreating(true)}
          >
            <PlusIcon className="size-4" />
            New request
          </Button>
        </header>
        {threads.isPending ? (
          <p className="py-10 text-center text-sm text-[#61709a]">
            Loading requests…
          </p>
        ) : null}
        {threads.isError ? (
          <p
            role="alert"
            className="py-10 text-center text-sm text-destructive"
          >
            We could not load your requests.
          </p>
        ) : null}
        {threads.data ? (
          <>
            <section
              aria-label="Support requests"
              className="overflow-hidden rounded-xl border border-[#dfe5f0] bg-white shadow-[0_5px_18px_rgba(30,50,96,0.04)]"
            >
              <SupportThreadList
                threads={threads.data.threads}
                workspaceSlug={workspaceSlug}
                page={page}
              />
            </section>
            <div className="flex items-center justify-between gap-3 text-xs font-medium text-[#61709a]">
              <Button
                variant="outline"
                className="h-9 rounded-lg border-[#dfe5f0] bg-white text-[#10204b]"
                disabled={page === 0 || threads.isFetching}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span>Page {page + 1}</span>
              <Button
                variant="outline"
                className="h-9 rounded-lg border-[#dfe5f0] bg-white text-[#10204b]"
                disabled={!threads.data.hasMore || threads.isFetching}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </>
        ) : null}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>New support request</DialogTitle>
              <DialogDescription>
                Tell us what you need help with. We’ll reply here.
              </DialogDescription>
            </DialogHeader>
            {isCreating ? (
              <NewSupportRequest
                organizationId={organizationId}
                workspaceSlug={workspaceSlug}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}

export { CustomerSupportPage }
