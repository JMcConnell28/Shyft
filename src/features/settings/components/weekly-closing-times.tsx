"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

type ClosingDay = {
  closeTime: string
  closeTimeNextDay: boolean
  weekday: number
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 py-3">
        <div>
          <p className="text-xs font-bold text-[#14214a]">Default time</p>
          <p className="mt-0.5 text-[11px] text-[#7180a2]">
            Apply to every day with one click.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onApplyFallback}
        >
          Apply to all days
        </Button>
      </div>
      <div className="grid grid-cols-[minmax(5rem,1fr)_6.5rem_auto] gap-2 pb-1 text-[10px] font-semibold text-[#7180a2]">
        <span>Day</span>
        <span className="text-center">Time</span>
        <span>Next day</span>
      </div>
      <ClosingTimeRow
        label="Default"
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
          onNextDayChange={(nextDay) =>
            onDayChange(index, { closeTimeNextDay: nextDay })
          }
          onTimeChange={(time) => onDayChange(index, { closeTime: time })}
        />
      ))}
      <p className="py-3 text-[11px] text-[#7180a2]">
        Next day means the location closes after midnight.
      </p>
    </div>
  )
}

function ClosingTimeRow({
  label,
  nextDay,
  onNextDayChange,
  onTimeChange,
  time,
}: {
  label: string
  nextDay: boolean
  onNextDayChange: (value: boolean) => void
  onTimeChange: (value: string) => void
  time: string
}) {
  return (
    <div className="grid grid-cols-[minmax(5rem,1fr)_6.5rem_auto] items-center gap-2 border-t border-[#e9edf5] py-2.5">
      <span className="text-xs font-semibold text-[#14214a]">{label}</span>
      <Input
        aria-label={`${label} closing time`}
        className="h-9 min-w-0 px-1 text-center text-xs"
        type="time"
        step={900}
        value={time}
        onChange={(event) => onTimeChange(event.target.value)}
      />
      <Switch
        aria-label={`${label} closes the next day`}
        checked={nextDay}
        onCheckedChange={onNextDayChange}
      />
    </div>
  )
}

export { WeeklyClosingTimes }
