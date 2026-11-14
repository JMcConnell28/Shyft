import { Link } from "@tanstack/react-router"

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
    <header className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <h1 className="min-w-0 text-2xl leading-8 font-bold tracking-tight">
        Manager dashboard
      </h1>
      <div className="flex w-full min-w-0 max-w-full flex-wrap items-center gap-2 sm:w-auto">
        <ManagerDashboardFilters
          locations={access.locations}
          locationId={locationId}
          date={data.date}
          isToday={data.isToday}
          onLocation={onLocation}
          onDate={onDate}
        />
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            variant="secondary"
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
              variant="secondary"
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
    </header>
  )
}
export { ManagerDashboardHeader }
