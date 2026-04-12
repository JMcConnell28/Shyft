"use client"

import { ArrowUpRightIcon, Clock3Icon, FileStackIcon, LoaderCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { WeekPreviewSummary } from "@/features/rota/hooks/use-rota-week-previews"
import {
  formatWeekDaysLabel,
  formatWeekRangeLabel,
} from "@/features/rota/utils/week-picker"

function NewRotaWeekListPicker({
  weekStarts,
  selectedWeekStart,
  onSelect,
}: {
  weekStarts: Array<{
    weekStart: string
    preview?: WeekPreviewSummary
  }>
  selectedWeekStart: string
  onSelect: (weekStart: string) => void
}) {
  return (
    <ScrollArea className="h-72 rounded-xl border border-border/70 bg-muted/10">
      <div className="space-y-1 p-2">
        {weekStarts.map(({ weekStart, preview }) => {
          const isSelected = weekStart === selectedWeekStart

          return (
            <button
              key={weekStart}
              type="button"
              onClick={() => onSelect(weekStart)}
              className={cn(
                "flex w-full flex-col gap-2 rounded-lg border px-3 py-3 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-background hover:border-border/70 hover:bg-background/90",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {formatWeekRangeLabel(weekStart)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatWeekDaysLabel(weekStart)}
                  </div>
                </div>

                {isSelected ? <Badge variant="secondary">Selected</Badge> : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                {preview?.isPending ? (
                  <span className="inline-flex items-center gap-1">
                    <LoaderCircleIcon className="size-3 animate-spin" />
                    Checking
                  </span>
                ) : preview?.existingRota ? (
                  <span className="inline-flex items-center gap-1 text-foreground">
                    <ArrowUpRightIcon className="size-3" />
                    Existing rota
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Clock3Icon className="size-3" />
                    New draft
                  </span>
                )}

                {preview?.hasPreviousPublished ? (
                  <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px]">
                    Can copy previous
                  </Badge>
                ) : null}

                {preview?.templateCount ? (
                  <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px]">
                    <FileStackIcon className="size-3" />
                    {preview.templateCount} templates
                  </Badge>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}

export { NewRotaWeekListPicker }
