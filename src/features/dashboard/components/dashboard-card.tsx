import type { ComponentPropsWithoutRef, ReactNode } from "react"

import { Frame } from "@/components/panelui/frame"
import { cn } from "@/lib/utils"

const dashboardCardFrameClassName =
  "min-w-0 rounded-[18px] border border-border bg-muted/40"
const dashboardCardPanelClassName =
  "group-data-[variant=band]/frame:rounded-xl group-data-[variant=band]/frame:border-0 group-data-[variant=band]/frame:shadow-none"

type DashboardCardProps = ComponentPropsWithoutRef<"section"> & {
  title: string
  headingId?: string
  description?: string
  descriptionId?: string
  action?: ReactNode
}

function DashboardCard({
  title,
  headingId,
  description,
  descriptionId,
  action,
  className,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <Frame
      variant="band"
      render={<section />}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className={cn(dashboardCardFrameClassName, className)}
      {...props}
    >
      <Frame.Header className="min-h-9 group-data-[variant=band]/frame:px-4 group-data-[variant=band]/frame:py-1">
        <Frame.Title as="h2" id={headingId} className="font-semibold">
          {title}
        </Frame.Title>
        {description ? (
          <Frame.Description id={descriptionId} className="text-xs">
            {description}
          </Frame.Description>
        ) : null}
        {action ? (
          <Frame.Action className={description ? undefined : "row-span-1"}>
            {action}
          </Frame.Action>
        ) : null}
      </Frame.Header>
      <Frame.Panel className={dashboardCardPanelClassName}>
        {children}
      </Frame.Panel>
    </Frame>
  )
}

export {
  DashboardCard,
  dashboardCardFrameClassName,
  dashboardCardPanelClassName,
}
