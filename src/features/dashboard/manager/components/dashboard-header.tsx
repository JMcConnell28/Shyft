import { Link } from "@tanstack/react-router"
import { DashboardCreateRotaButton } from "./create-rota-button"
import { ManagerDashboardFilters } from "./dashboard-filters"
import type { ManagerDashboardAccess, ManagerDayData } from "../types"
import { parseRotaListSearch } from "@/features/rota/schemas/rota-schemas"
import { Button } from "@/components/ui/button"

const dashboardActionClassName =
  "h-11 rounded-lg px-3 text-sm font-medium shadow-none md:h-9"

function ManagerDashboardHeader({
  access,
  data,
  locationId,
  workspaceSlug,
  onLocation,
  onDate,
}: {
  access: ManagerDashboardAccess
  data: ManagerDayData
  locationId: string
  workspaceSlug: string
  onLocation: (id: string) => void
  onDate: (date?: string) => void
}) {
  return (
    <header className="grid min-w-0 gap-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight font-semibold tracking-[-0.03em] sm:text-[28px]">
            Manager dashboard
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Staffing, attendance and rota planning.
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <DashboardCreateRotaButton
            key={locationId}
            access={access}
            location={data.location}
          />
          <Button
            nativeButton={false}
            variant="outline"
            className={dashboardActionClassName}
            render={
              <Link
                to="/app/$workspaceSlug/rota"
                params={{ workspaceSlug }}
                search={parseRotaListSearch({ location: data.location.slug })}
              />
            }
          >
            Rotas
          </Button>
          {data.location.attendanceEnabled ? (
            <Button
              nativeButton={false}
              variant="outline"
              className={dashboardActionClassName}
              render={
                <Link
                  to="/app/$workspaceSlug/time-clock"
                  params={{ workspaceSlug }}
                />
              }
            >
              Time tracking
            </Button>
          ) : null}
        </div>
      </div>
      <ManagerDashboardFilters
        locations={access.locations}
        locationId={locationId}
        date={data.date}
        isToday={data.isToday}
        onLocation={onLocation}
        onDate={onDate}
      />
    </header>
  )
}
export { ManagerDashboardHeader }
