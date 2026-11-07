import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function EmployeeIdentity({
  name,
  secondary,
  size = "default",
  tone = "brand",
}: {
  name: string
  secondary?: string
  size?: "compact" | "default"
  tone?: "brand" | "neutral"
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        className={cn(
          tone === "brand"
            ? "bg-[#eaf0ff] after:border-[#d9e2f7] dark:bg-blue-950 dark:after:border-blue-900"
            : "bg-muted after:border-border",
          size === "compact" && "size-7"
        )}
      >
        <AvatarFallback
          className={cn(
            "text-[11px]",
            tone === "brand"
              ? "bg-[#eaf0ff] font-bold text-[#315fb5] dark:bg-blue-950 dark:text-blue-200"
              : "bg-muted font-semibold text-muted-foreground"
          )}
        >
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        {secondary ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {secondary}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase() ?? "")
    .join("")
}

export { EmployeeIdentity }
