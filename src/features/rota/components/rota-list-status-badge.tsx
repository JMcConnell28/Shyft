import type { RotaListItem } from "@/features/rota/types"
import { Badge } from "@/components/panelui/badge"

function RotaListStatusBadge({
  status,
  className,
}: {
  status: RotaListItem["status"]
  className?: string
}) {
  return (
    <Badge
      variant={status === "published" ? "success" : "warning"}
      dot
      className={className}
    >
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  )
}

export { RotaListStatusBadge }
