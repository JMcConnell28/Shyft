import type { ComponentPropsWithoutRef, ReactNode } from "react"

import { Frame } from "@/components/panelui/frame"
import { cn } from "@/lib/utils"

type ManagerDashboardCardProps = ComponentPropsWithoutRef<"section"> & {
  title: string
  headingId?: string
  description?: string
  descriptionId?: string
  action?: ReactNode
}

function ManagerDashboardCard({
  title,
  headingId,
  description,
  descriptionId,
  action,
  className,
  children,
  ...props
}: ManagerDashboardCardProps) {
  return (
    <Frame
      variant="band"
      render={<section />}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className={cn("min-w-0", className)}
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
      <Frame.Panel>{children}</Frame.Panel>
    </Frame>
  )
}

export { ManagerDashboardCard }
