import { Button } from "@/components/ui/button"

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
      <Button variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
export { ManagerDashboardError }
