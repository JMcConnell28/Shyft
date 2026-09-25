import type { RotaListItem } from "@/features/rota/types"
import { cn } from "@/lib/utils"

function RotaListStatusBadge({
  status,
  className,
}: {
  status: RotaListItem["status"]
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] leading-4 font-semibold",
        status === "published"
          ? "bg-[#e9f8ee] text-[#20984d]"
          : "bg-[#fff3d9] text-[#c77b00]",
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "published" ? "bg-[#39c76b]" : "bg-[#f2a900]"
        )}
      />
      {status === "published" ? "Published" : "Draft"}
    </span>
  )
}

export { RotaListStatusBadge }
