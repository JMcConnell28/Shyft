import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function TimesheetPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-[#e0e5ef] bg-white shadow-[0_8px_28px_rgba(26,43,83,0.045)]",
        className
      )}
    >
      {children}
    </section>
  )
}

function TimesheetPanelHeader({
  action,
  icon: Icon,
  subtitle,
  title,
}: {
  action?: ReactNode
  icon?: LucideIcon
  subtitle?: string
  title: string
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-[#edf0f6] px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#236cff]">
            <Icon className="size-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs font-medium text-[#7481a0]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function TimesheetPill({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-[#dfe4ef] bg-[#fafbfe] px-2.5 py-1 text-[11px] font-semibold text-[#617096]",
        className
      )}
    >
      {children}
    </span>
  )
}

export { TimesheetPanel, TimesheetPanelHeader, TimesheetPill }
