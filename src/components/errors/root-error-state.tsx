import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/errors"

function RootErrorState({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-6 shadow-lg shadow-slate-950/10">
        <p className="text-sm font-medium text-muted-foreground">Application error</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Something interrupted this page.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {getErrorMessage(error, "Please try again or reload the page.")}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.reload()
            }}
          >
            Reload page
          </Button>
        </div>
      </div>
    </div>
  )
}

export { RootErrorState }
