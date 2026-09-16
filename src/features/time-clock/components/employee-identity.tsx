import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function EmployeeIdentity({
  name,
  secondary,
  size = "default",
}: {
  name: string
  secondary?: string
  size?: "compact" | "default"
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        className={cn(
          "bg-[#eaf0ff] after:border-[#d9e2f7]",
          size === "compact" && "size-7"
        )}
      >
        <AvatarFallback className="bg-[#eaf0ff] text-[11px] font-bold text-[#315fb5]">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#10204b]">{name}</p>
        {secondary ? (
          <p className="mt-0.5 truncate text-[11px] font-medium text-[#7481a0]">
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
