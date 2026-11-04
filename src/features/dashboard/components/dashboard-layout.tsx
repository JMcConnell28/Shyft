import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

function DashboardLayout({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[96rem] min-w-0 flex-1 flex-col gap-4 px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-foreground sm:px-6 sm:pt-5",
        className
      )}
      {...props}
    />
  )
}

function DashboardPanel({
  children,
  className,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-xl border border-border bg-card text-card-foreground",
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

function DashboardPanelHeader({
  action,
  title,
  headingId,
}: {
  action?: ReactNode
  title: string
  headingId?: string
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 px-3.5 sm:px-4">
      <h2
        id={headingId}
        className="min-w-0 text-sm font-semibold tracking-tight sm:text-[15px]"
      >
        {title}
      </h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function DashboardEmptyState({
  title,
  className,
}: {
  title: string
  className?: string
}) {
  return (
    <p
      className={cn(
        "px-3.5 py-4 text-sm text-muted-foreground sm:px-4",
        className
      )}
    >
      {title}
    </p>
  )
}

export {
  DashboardEmptyState,
  DashboardLayout,
  DashboardPanel,
  DashboardPanelHeader,
}
