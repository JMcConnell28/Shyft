"use client"

import { InfoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type ClosingDay = {
  closeTime: string
  closeTimeNextDay: boolean
  weekday: number
}

function WeeklyClosingTimes({
  days,
  fallbackNextDay,
  fallbackTime,
  onApplyFallback,
  onDayChange,
  onFallbackNextDayChange,
  onFallbackTimeChange,
}: {
  days: Array<ClosingDay>
  fallbackNextDay: boolean
  fallbackTime: string
  onApplyFallback: () => void
  onDayChange: (index: number, value: Partial<ClosingDay>) => void
  onFallbackNextDayChange: (value: boolean) => void
  onFallbackTimeChange: (value: string) => void
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold tracking-[-0.035em] text-[#11245a]">
            Closing times
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#61709a]">
            Set the default closing time for each day.
          </p>
        </div>
        <Button
          type="button"
          variant="pill"
          size="sm"
          className="h-9 shrink-0 rounded-xl bg-[#eef3ff] px-3 text-xs font-extrabold text-[#0069ff] hover:bg-[#e5edff]"
          onClick={onApplyFallback}
        >
          Apply default
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        <ClosingTimeRow
          label="Default"
          emphasized
          nextDay={fallbackNextDay}
          time={fallbackTime}
          onNextDayChange={onFallbackNextDayChange}
          onTimeChange={onFallbackTimeChange}
        />

        {days.map((day, index) => (
          <ClosingTimeRow
            key={day.weekday}
            label={weekdayLabels[day.weekday - 1] ?? `Day ${day.weekday}`}
            nextDay={day.closeTimeNextDay}
            time={day.closeTime}
            onNextDayChange={(closeTimeNextDay) =>
              onDayChange(index, { closeTimeNextDay })
            }
            onTimeChange={(closeTime) => onDayChange(index, { closeTime })}
          />
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs font-semibold text-[#61709a]">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-[#0069ff]" />
        Closing times are used to calculate shift lengths and late finishes.
      </p>
    </section>
  )
}

function ClosingTimeRow({
  emphasized = false,
  label,
  nextDay,
  onNextDayChange,
  onTimeChange,
  time,
}: {
  emphasized?: boolean
  label: string
  nextDay: boolean
  onNextDayChange: (value: boolean) => void
  onTimeChange: (value: string) => void
  time: string
}) {
  return (
    <div
      className={cn(
        "grid min-h-13 grid-cols-[minmax(3.5rem,1fr)_6.5rem_auto] items-center gap-2 rounded-xl border border-[#dfe5f0] bg-white px-3 py-2 text-[#11245a]",
        emphasized && "bg-[#f8faff]"
      )}
    >
      <span
        className={cn(
          "text-sm font-extrabold tracking-[0.02em]",
          emphasized && "text-[#0069ff]"
        )}
      >
        {label}
      </span>
      <Input
        aria-label={`${label} closing time`}
        className="closing-time-input h-9 min-h-9 rounded-lg border-0 bg-transparent px-1 text-right text-sm font-bold text-[#11245a] shadow-none focus-visible:ring-0"
        type="time"
        step={900}
        value={time}
        onChange={(event) => onTimeChange(event.target.value)}
      />
      <div className="flex items-center justify-end gap-2">
        {nextDay ? (
          <span className="hidden text-xs font-semibold text-[#61709a] min-[390px]:inline">
            Next day
          </span>
        ) : null}
        <Switch
          aria-label={`${label} closes the next day`}
          checked={nextDay}
          onCheckedChange={onNextDayChange}
        />
      </div>
    </div>
  )
}

const weekdayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

export { WeeklyClosingTimes }
