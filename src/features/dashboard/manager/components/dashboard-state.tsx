import { useRouter } from "@tanstack/react-router"
import { dashboardButtonClass } from "../constants"
import { Button } from "@/components/ui/button"
import {
  DashboardPanel,
  DashboardPanelContent,
} from "@/features/dashboard/components/dashboard-layout"

function ManagerDashboardLoading() {
  return (
    <DashboardPanel
      variant="framed"
      role="status"
      aria-label="Loading manager dashboard"
    >
      <div className="flex min-h-13 items-center px-4">
        <div className="h-4 w-28 rounded bg-muted motion-safe:animate-pulse" />
      </div>
      <DashboardPanelContent>
        <div className="p-4">
          <div className="h-11 rounded-lg bg-muted/60 motion-safe:animate-pulse md:h-8" />
        </div>
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="flex h-16 items-center gap-3 border-t border-border/60 px-4 motion-safe:animate-pulse"
          >
            <div className="size-7 rounded-full bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="ml-auto h-5 w-16 rounded bg-muted" />
          </div>
        ))}
      </DashboardPanelContent>
      <span className="sr-only">Loading staffing…</span>
    </DashboardPanel>
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
      className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
    >
      <p>{message}</p>
      <Button
        variant="outline"
        className={dashboardButtonClass}
        onClick={onRetry}
      >
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
