import { Suspense, lazy, useState } from "react"
import { format, parseISO } from "date-fns"
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { moveDashboardDate } from "../utils/date"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

const MobileCalendar = lazy(() =>
  import("@/components/ui/calendar").then(({ Calendar }) => ({
    default: Calendar,
  }))
)

function DashboardMobileDatePicker({
  date,
  isToday,
  onDate,
}: {
  date: string
  isToday: boolean
  onDate: (date?: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedDate = parseISO(date)

  function selectDate(value?: string) {
    onDate(value)
    setOpen(false)
  }

  return (
    <div className="w-36 shrink-0 sm:hidden">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="h-11 w-full justify-start gap-2 rounded-lg px-3 text-[#10204b]"
              aria-label={`Staffing date: ${format(selectedDate, "EEEE d MMMM yyyy")}`}
            />
          }
        >
          <CalendarDaysIcon className="size-4 text-[#7481a0]" />
          {isToday ? "Today" : format(selectedDate, "d MMM yyyy")}
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-auto gap-0 overflow-hidden p-0 sm:hidden"
        >
          <PopoverTitle className="sr-only">Choose staffing date</PopoverTitle>
          <Suspense
            fallback={
              <div
                role="status"
                className="flex h-80 w-69 items-center justify-center text-xs text-[#7481a0] min-[360px]:w-76"
              >
                Loading calendar…
              </div>
            }
          >
            <MobileCalendar
              autoFocus
              mode="single"
              required
              selected={selectedDate}
              defaultMonth={selectedDate}
              weekStartsOn={1}
              className="[--cell-size:2.25rem] min-[360px]:[--cell-size:2.5rem]"
              onSelect={(value) => selectDate(format(value, "yyyy-MM-dd"))}
            />
          </Suspense>
          <div className="flex items-center justify-between border-t border-[#edf0f6] p-2">
            <Button
              variant="ghost"
              className="size-11 rounded-lg"
              aria-label="Previous day"
              onClick={() => selectDate(moveDashboardDate(date, -1))}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="ghost"
              className="h-11 rounded-lg px-4"
              onClick={() => selectDate()}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              className="size-11 rounded-lg"
              aria-label="Next day"
              onClick={() => selectDate(moveDashboardDate(date, 1))}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DashboardMobileDatePicker }
