import { Suspense, lazy } from "react"
import { getDashboardWeekStart } from "../utils/date"
import type { DashboardLocation, ManagerDashboardAccess } from "../types"
import { Button } from "@/components/ui/button"
import { getDateKeyInTimeZone } from "@/lib/time-zone"

const NewRotaDialog = lazy(() =>
  import("@/features/rota/components/new-rota-dialog").then((module) => ({
    default: module.NewRotaDialog,
  }))
)

function DashboardCreateRotaButton({
  access,
  location,
}: {
  access: ManagerDashboardAccess
  location: DashboardLocation
}) {
  if (!access.capabilities.canCreateRota || !location.canWrite) return null
  const locations = access.locations
    .filter((item) => item.canWrite)
    .map((item) => ({ ...item, hasUnreadPublished: false }))
  return (
    <Suspense
      fallback={
        <Button disabled className="h-9">
          Create rota
        </Button>
      }
    >
      <NewRotaDialog
        locations={locations}
        selectedLocation={
          locations.find((item) => item.id === location.id) ?? null
        }
        initialWeekStart={getDashboardWeekStart(
          getDateKeyInTimeZone(new Date(), location.timeZone)
        )}
        triggerLabel="Create rota"
        triggerClassName="h-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      />
    </Suspense>
  )
}
export { DashboardCreateRotaButton }
