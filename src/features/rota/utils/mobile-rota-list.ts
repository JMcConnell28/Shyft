import { format } from "date-fns"

import type { RotaListItem } from "@/features/rota/types"

function formatMobileRotaUpdatedLabel(
  row: Pick<RotaListItem, "status" | "updatedAt">,
  now = new Date()
) {
  const updatedDate = row.updatedAt.split(",").at(0) ?? row.updatedAt

  if (row.status === "published") {
    return `Published on ${updatedDate}`
  }

  return `Last edited ${updatedDate === format(now, "d MMM yyyy") ? "today" : updatedDate}`
}

export { formatMobileRotaUpdatedLabel }
