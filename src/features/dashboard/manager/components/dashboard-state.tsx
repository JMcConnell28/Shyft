import { useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

function ManagerDashboardLoading() {
  return (
    <div
      role="status"
      aria-label="Loading manager dashboard"
      className="space-y-2 rounded-xl border border-border bg-card p-4"
    >
      <div className="h-5 w-32 rounded-md bg-muted motion-safe:animate-pulse" />
      <div className="h-28 rounded-lg bg-muted/60 motion-safe:animate-pulse" />
      <span className="sr-only">Loading staffing…</span>
    </div>
  )
}
function ManagerDashboardError({
  onRetry,
  message = "We could not load staffing for this location.",
}: {
  onRetry: () => void
  message?: string
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
    >
      <p>{message}</p>
      <Button variant="outline" className="h-11 md:h-9" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
function DashboardRouteError() {
  const router = useRouter()
  return (
    <ManagerDashboardError
      message="We could not load your workspace dashboard."
      onRetry={() => void router.invalidate()}
    />
  )
}
export { ManagerDashboardLoading, ManagerDashboardError, DashboardRouteError }
