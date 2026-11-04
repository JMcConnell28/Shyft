import { getDashboardWeekStart } from "../utils/date"
import type { DashboardLocation, ManagerDashboardAccess } from "../types"
import { getDateKeyInTimeZone } from "@/lib/time-zone"
import { NewRotaDialog } from "@/features/rota/components/new-rota-dialog"

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
    <NewRotaDialog
      locations={locations}
      selectedLocation={
        locations.find((item) => item.id === location.id) ?? null
      }
      initialWeekStart={getDashboardWeekStart(
        getDateKeyInTimeZone(new Date(), location.timeZone)
      )}
      triggerLabel="Create rota"
      triggerClassName="h-11 gap-1.5 rounded-lg bg-primary px-2.5 text-xs text-primary-foreground shadow-none hover:bg-primary/90 hover:text-primary-foreground sm:px-3 sm:text-sm md:h-9 [&_svg]:size-4"
    />
  )
}
export { DashboardCreateRotaButton }
