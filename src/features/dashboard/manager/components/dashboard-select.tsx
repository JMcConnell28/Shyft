import { ChevronDownIcon } from "lucide-react"
import { dashboardSelectClass } from "../constants"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

function DashboardSelect({
  label,
  containerClassName,
  className,
  children,
  ...props
}: ComponentProps<"select"> & {
  label: string
  containerClassName?: string
}) {
  return (
    <label className={cn("relative block min-w-0", containerClassName)}>
      <span className="sr-only">{label}</span>
      <select
        {...props}
        className={cn(
          dashboardSelectClass,
          "w-full appearance-none pr-7",
          className
        )}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </label>
  )
}

export { DashboardSelect }
