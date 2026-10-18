import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { dashboardSelectClass } from "../constants"
import { moveDashboardDate } from "../utils/date"
import { DashboardMobileDatePicker } from "./mobile-date-picker"
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
    <div className="flex items-center gap-2 sm:flex-wrap">
      <label className="min-w-0 flex-1 sm:max-w-64 sm:min-w-40">
        <span className="sr-only">Location</span>
        <select
          className={`${dashboardSelectClass} h-11 w-full truncate sm:h-10`}
          value={locationId}
          onChange={(event) => onLocation(event.target.value)}
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </label>
      <DashboardMobileDatePicker
        date={date}
        isToday={isToday}
        onDate={onDate}
      />
      <div className="hidden items-center gap-1 sm:flex">
        <Button
          aria-label="Previous day"
          variant="outline"
          className="size-10 rounded-lg"
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
          className="size-10 rounded-lg"
          onClick={() => onDate(moveDashboardDate(date, 1))}
        >
          <ChevronRightIcon />
        </Button>
      </div>
      <Button
        variant={isToday ? "secondary" : "outline"}
        className="hidden h-10 rounded-lg sm:inline-flex"
        onClick={() => onDate(undefined)}
      >
        Today
      </Button>
    </div>
  )
}

export { ManagerDashboardFilters }
