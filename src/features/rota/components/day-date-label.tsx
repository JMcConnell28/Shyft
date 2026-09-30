import type { WorkspaceDay } from "@/features/rota/types/workspace"

function DayDateLabel({ day }: { day: WorkspaceDay }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-extrabold tracking-[0.14em] text-[#61709a] uppercase">
        {day.shortLabel}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-base leading-none font-extrabold tracking-[-0.04em] text-[#11245a]">
          {day.dayNumber}
        </span>
        <span className="text-xs font-semibold text-[#61709a]">
          {day.monthLabel}
        </span>
      </div>
    </div>
  )
}

export { DayDateLabel }
