import { Link } from "@tanstack/react-router"

import { buttonVariants } from "@/components/ui/button"
import { DashboardCard } from "@/features/dashboard/components/dashboard-card"
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout"

function ShiftSwapDisabledState({ dashboardHref }: { dashboardHref: string }) {
  return (
    <DashboardLayout className="max-w-[1440px] sm:gap-6 sm:pt-6">
      <header>
        <h1 className="text-2xl leading-8 font-bold tracking-tight">
          Shift swaps
        </h1>
      </header>
      <DashboardCard
        title="Shift swapping is turned off"
        headingId="shift-swaps-disabled"
        className="w-full max-w-xl"
      >
        <div className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">
            Your workspace has disabled shift swaps and cover requests. Ask a
            manager if you need to change a shift.
          </p>
          <Link
            className={buttonVariants({ variant: "secondary" })}
            to={dashboardHref}
          >
            Back to dashboard
          </Link>
        </div>
      </DashboardCard>
    </DashboardLayout>
  )
}

export { ShiftSwapDisabledState }
