import type { RotaListItem } from "@/features/rota/types"

function isCurrentRota(row: RotaListItem) {
  const today = toLocalDateValue()

  return row.weekStart <= today && row.weekEnd >= today
}

function toLocalDateValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export { isCurrentRota }
