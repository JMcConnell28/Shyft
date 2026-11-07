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
  variant = "default",
  ...props
}: ComponentProps<"section"> & { variant?: "default" | "framed" }) {
  return (
    <section
      className={cn(
        "group/dashboard-panel min-w-0 rounded-xl border border-border bg-card text-card-foreground",
        variant === "framed" && "rounded-[14px] bg-muted/30",
        className
      )}
      data-variant={variant}
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
  description,
}: {
  action?: ReactNode
  title: string
  headingId?: string
  description?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-12 items-center justify-between gap-3 px-3.5 sm:px-4",
        description && "min-h-16 px-4 py-4 sm:px-5",
        "group-data-[variant=framed]/dashboard-panel:min-h-13 group-data-[variant=framed]/dashboard-panel:px-4 group-data-[variant=framed]/dashboard-panel:py-2.5"
      )}
    >
      <div className="min-w-0">
        <h2
          id={headingId}
          className="min-w-0 text-sm font-semibold tracking-tight group-data-[variant=framed]/dashboard-panel:text-sm group-data-[variant=framed]/dashboard-panel:leading-5 group-data-[variant=framed]/dashboard-panel:tracking-normal sm:text-[15px]"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function DashboardPanelContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-b-[13px] border-t border-border/60 bg-card",
        className
      )}
      {...props}
    />
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
  DashboardPanelContent,
  DashboardPanelHeader,
}
