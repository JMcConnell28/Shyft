import { useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

function ManagerDashboardLoading() {
  return (
    <div
      role="status"
      aria-label="Loading manager dashboard"
      className="space-y-3 p-4"
    >
      <div className="h-16 animate-pulse rounded-xl bg-blue-50" />
      <div className="h-64 animate-pulse rounded-xl bg-slate-50" />
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
      className="rounded-xl border border-[#e0e6f1] bg-white p-6 text-sm text-[#46577d]"
    >
      <p>{message}</p>
      <Button variant="outline" className="mt-3 h-9" onClick={onRetry}>
        Try again
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
