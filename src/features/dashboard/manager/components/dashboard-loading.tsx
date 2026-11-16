import { DashboardCard } from "@/features/dashboard/components/dashboard-card"

function ManagerDashboardLoading() {
  return (
    <DashboardCard title="Team" role="status">
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
      <span className="sr-only">Loading staffing…</span>
    </DashboardCard>
  )
}

export { ManagerDashboardLoading }
