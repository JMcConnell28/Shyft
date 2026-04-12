import type { WorkspaceDay } from "@/features/rota/types/workspace"

function DayDate({ day }: { day: WorkspaceDay }) {
  return (
    <div className="flex items-center justify-center py-2 text-center">
      <span className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {day.shortLabel}
      </span>
      <div className="ml-2">
        <span className="text-xs">{day.dayNumber} </span>
        <span className="text-xs text-muted-foreground">{day.monthLabel}</span>
      </div>
    </div>
  )
}

export default DayDate
