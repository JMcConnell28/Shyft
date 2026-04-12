"use client"

import * as React from "react"
import { addMonths, format, subMonths } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon, LoaderCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WeekPreviewSummary } from "@/features/rota/hooks/use-rota-week-previews"
import {
  buildMonthWeekStarts,
  buildWeekDayNumbers,
  formatWeekDaysLabel,
} from "@/features/rota/utils/week-picker"

function NewRotaWeekRowCalendar({
  month,
  selectedWeekStart,
  onMonthChange,
  onSelect,
  previewByWeekStart,
}: {
  month: Date
  selectedWeekStart: string
  onMonthChange: (month: Date) => void
  onSelect: (weekStart: string) => void
  previewByWeekStart: Record<string, WeekPreviewSummary | undefined>
}) {
  const weekStarts = React.useMemo(() => buildMonthWeekStarts(month), [month])

  return (
    <div className="rounded-xl border border-border/70 bg-background">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => onMonthChange(subMonths(month, 1))}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <div className="text-sm font-medium">{format(month, "MMMM yyyy")}</div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="space-y-1 p-2">
        {weekStarts.map((weekStart) => {
          const preview = previewByWeekStart[weekStart]
          const isSelected = weekStart === selectedWeekStart
          const days = buildWeekDayNumbers(weekStart)

          return (
            <button
              key={weekStart}
              type="button"
              onClick={() => onSelect(weekStart)}
              className={cn(
                "flex w-full flex-col gap-2 rounded-lg border px-3 py-3 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-border/70 hover:bg-muted/20",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium">{formatWeekDaysLabel(weekStart)}</div>
                {preview?.isPending ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <LoaderCircleIcon className="size-3 animate-spin" />
                    Checking
                  </span>
                ) : preview?.existingRota ? (
                  <Badge variant="secondary">Exists</Badge>
                ) : (
                  <Badge variant="outline">Open</Badge>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => (
                  <div
                    key={day.key}
                    className="rounded-md border border-border/60 bg-muted/15 px-1 py-1.5 text-center"
                  >
                    <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {day.shortLabel}
                    </div>
                    <div className="mt-1 text-xs font-medium">{day.dayOfMonth}</div>
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { NewRotaWeekRowCalendar }
