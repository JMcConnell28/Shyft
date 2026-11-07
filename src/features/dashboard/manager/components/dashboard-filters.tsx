import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { dashboardButtonClass, dashboardSelectClass } from "../constants"
import { moveDashboardDate } from "../utils/date"
import { DashboardMobileDatePicker } from "./mobile-date-picker"
import { DashboardSelect } from "./dashboard-select"
import type { DashboardLocation } from "../types"
import { isoDateSchema } from "@/features/rota/schemas/rota-schemas"
import { Button } from "@/components/ui/button"

function ManagerDashboardFilters({
  locations,
  locationId,
  date,
  isToday,
  onLocation,
  onDate,
}: {
  locations: Array<DashboardLocation>
  locationId: string
  date: string
  isToday: boolean
  onLocation: (id: string) => void
  onDate: (date?: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <DashboardSelect
        label="Location"
        containerClassName="sm:w-52 sm:max-w-72"
        className="truncate"
        value={locationId}
        onChange={(event) => onLocation(event.target.value)}
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </DashboardSelect>
      <DashboardMobileDatePicker
        date={date}
        isToday={isToday}
        onDate={onDate}
      />
      <div className="hidden items-center gap-2 sm:flex">
        <Button
          aria-label="Previous day"
          variant="outline"
          className="size-11 rounded-lg bg-card shadow-none md:size-8"
          onClick={() => onDate(moveDashboardDate(date, -1))}
        >
          <ChevronLeftIcon />
        </Button>
        <label>
          <span className="sr-only">Staffing date</span>
          <input
            type="date"
            className={`${dashboardSelectClass} w-36`}
            value={date}
            onChange={(event) => {
              const parsed = isoDateSchema.safeParse(event.target.value)
              if (parsed.success) onDate(parsed.data)
            }}
          />
        </label>
        <Button
          aria-label="Next day"
          variant="outline"
          className="size-11 rounded-lg bg-card shadow-none md:size-8"
          onClick={() => onDate(moveDashboardDate(date, 1))}
        >
          <ChevronRightIcon />
        </Button>
      </div>
      <Button
        variant={isToday ? "secondary" : "outline"}
        className={`${dashboardButtonClass} hidden sm:inline-flex`}
        onClick={() => onDate(undefined)}
      >
        Today
      </Button>
    </div>
  )
}

export { ManagerDashboardFilters }
