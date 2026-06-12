"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

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
  days: ClosingDay[]
  fallbackNextDay: boolean
  fallbackTime: string
  onApplyFallback: () => void
  onDayChange: (index: number, value: Partial<ClosingDay>) => void
  onFallbackNextDayChange: (value: boolean) => void
  onFallbackTimeChange: (value: string) => void
}) {
  return (
    <section className="border-y border-border/70">
      <div className="flex items-start justify-between gap-4 py-4">
        <div>
          <h3 className="text-sm font-semibold">Weekly closing times</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Set each day’s expected close for rota planning.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-primary"
          onClick={onApplyFallback}
        >
          Apply default
        </Button>
      </div>

      <div className="grid grid-cols-[minmax(5rem,1fr)_7.5rem_4.5rem] items-center gap-3 border-t border-border/70 bg-muted/25 px-1 py-2 text-[11px] font-medium text-muted-foreground">
        <span>Day</span>
        <span>Close</span>
        <span className="text-right">Next day</span>
      </div>

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
    <div className="grid min-h-12 grid-cols-[minmax(5rem,1fr)_7.5rem_4.5rem] items-center gap-3 border-t border-border/60 px-1 py-2 first:border-t-0">
      <span className={emphasized ? "text-sm font-semibold" : "text-sm"}>
        {label}
      </span>
      <Input
        aria-label={`${label} closing time`}
        className="closing-time-input h-8 min-h-8 px-2 text-xs"
        type="time"
        step={900}
        value={time}
        onChange={(event) => onTimeChange(event.target.value)}
      />
      <div className="flex justify-end">
        <Switch
          aria-label={`${label} closes the next day`}
          checked={nextDay}
          onCheckedChange={onNextDayChange}
        />
      </div>
    </div>
  )
}

const weekdayLabels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export { WeeklyClosingTimes }
