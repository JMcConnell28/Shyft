import { Link } from "@tanstack/react-router"
import { dashboardButtonClass } from "../constants"
import { DashboardCreateRotaButton } from "./create-rota-button"
import { ManagerDashboardFilters } from "./dashboard-filters"
import type { ManagerDashboardAccess, ManagerDayData } from "../types"
import { parseRotaListSearch } from "@/features/rota/schemas/rota-schemas"
import { Button } from "@/components/ui/button"

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
    <header className="grid min-w-0 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <div className="min-w-0">
          <h1 className="text-2xl leading-8 font-bold tracking-tight">
            Manager dashboard
          </h1>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            className={dashboardButtonClass}
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
              className={dashboardButtonClass}
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
          <DashboardCreateRotaButton
            key={locationId}
            access={access}
            location={data.location}
          />
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
