import { RefreshCwIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { DashboardCreateRotaButton } from "./create-rota-button"
import { DashboardStaffingStatus } from "./staffing-status"
import { ManagerDashboardFilters } from "./dashboard-filters"
import type { ManagerDashboardAccess, ManagerDayData } from "../types"
import { parseRotaListSearch } from "@/features/rota/schemas/rota-schemas"
import { Button } from "@/components/ui/button"

function ManagerDashboardHeader({
  access,
  data,
  locationId,
  workspaceSlug,
  refreshing,
  staffingStatus,
  onLocation,
  onDate,
  onRefresh,
}: {
  access: ManagerDashboardAccess
  data: ManagerDayData
  locationId: string
  workspaceSlug: string
  refreshing: boolean
  staffingStatus: "pending" | "error" | "success"
  onLocation: (id: string) => void
  onDate: (date?: string) => void
  onRefresh: () => void
}) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#10204b]">
            Staffing overview
          </h1>
          <p className="mt-1 text-xs text-[#7481a0]">
            {data.location.attendanceEnabled
              ? data.isToday
                ? "Live attendance"
                : "Recorded attendance"
              : "Published staffing"}
            {" · "}
            {data.location.timeZone}
            <DashboardStaffingStatus
              status={staffingStatus}
              updatedAt={data.updatedAt}
              timeZone={data.location.timeZone}
              timeFormat={data.location.timeFormat}
            />
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DashboardCreateRotaButton
            key={locationId}
            access={access}
            location={data.location}
          />
          <Button
            nativeButton={false}
            variant="outline"
            className="h-9 rounded-lg"
            render={
              <Link
                to="/app/$workspaceSlug/rota"
                params={{ workspaceSlug }}
                search={parseRotaListSearch({ location: data.location.slug })}
              />
            }
          >
            Open rotas
          </Button>
          {data.location.attendanceEnabled ? (
            <Button
              nativeButton={false}
              variant="outline"
              className="h-9 rounded-lg"
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
          <Button
            aria-label="Refresh dashboard"
            variant="outline"
            className="size-9 rounded-lg"
            disabled={refreshing}
            onClick={onRefresh}
          >
            <RefreshCwIcon
              className={refreshing ? "size-4 animate-spin" : "size-4"}
            />
          </Button>
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
