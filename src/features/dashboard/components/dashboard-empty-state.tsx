import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "compact",
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  variant?: "compact" | "featured"
}) {
  const isFeatured = variant === "featured"

  return (
    <Empty
      className={cn(
        "gap-3.5 px-4",
        isFeatured ? "min-h-48 py-7" : "items-stretch py-5 text-left text-wrap"
      )}
    >
      <EmptyHeader
        className={cn(
          isFeatured ? "gap-2.5" : "max-w-none flex-row items-start gap-3"
        )}
      >
        <EmptyMedia
          variant="icon"
          className={cn(
            "mb-0 rounded-lg text-muted-foreground",
            isFeatured && "size-10"
          )}
        >
          <Icon
            className={isFeatured ? "size-5" : "size-4"}
            aria-hidden="true"
          />
        </EmptyMedia>
        <div className="space-y-1">
          <EmptyTitle className="font-semibold">{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </div>
      </EmptyHeader>
      {action}
    </Empty>
  )
}

export { DashboardEmptyState }
