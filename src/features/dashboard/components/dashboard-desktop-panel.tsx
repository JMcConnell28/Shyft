import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DashboardPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[14px] border border-[#dfe5f0] bg-card shadow-[0_8px_24px_rgba(30,50,96,0.045)]",
        className
      )}
    >
      {children}
    </section>
  )
}

function DashboardPanelHeader({
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
    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-[#edf0f6] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#eef3ff] text-[#0069ff]">
            <Icon className="size-4.5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#11245a]">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs font-medium text-[#7a86a4]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function DashboardEmptyState({
  description,
  title,
  className,
}: {
  description?: string
  title: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-dashed border-[#dfe5f0] bg-[#fbfcff] px-4 py-7 text-center",
        className
      )}
    >
      <p className="text-sm font-semibold text-[#26365f]">{title}</p>
      {description ? (
        <p className="mt-1 text-xs font-medium text-[#7a86a4]">{description}</p>
      ) : null}
    </div>
  )
}

export { DashboardEmptyState, DashboardPanel, DashboardPanelHeader }
