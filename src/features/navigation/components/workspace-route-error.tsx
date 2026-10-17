import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

function WorkspaceRouteError() {
  const router = useRouter()
  const [retrying, setRetrying] = React.useState(false)
  const [retryFailed, setRetryFailed] = React.useState(false)
  async function retry(): Promise<void> {
    if (retrying) return
    setRetrying(true)
    setRetryFailed(false)
    try {
      await router.invalidate()
    } catch {
      setRetryFailed(true)
    } finally {
      setRetrying(false)
    }
  }
  return (
    <div role="alert" className="m-4 rounded-xl border bg-card p-6 sm:m-6">
      <h1 className="text-lg font-semibold">We could not load this page.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Check your connection and try again.
      </p>
      {retryFailed && (
        <p className="mt-2 text-sm text-destructive">
          The page is still unavailable. Please try again.
        </p>
      )}
      <Button className="mt-4" disabled={retrying} onClick={() => void retry()}>
        {retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  )
}

export { WorkspaceRouteError }
