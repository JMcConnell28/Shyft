import type { NewRotaSource } from "../schemas/rota-schemas"
import type { AccessibleRotaLocation } from "../types"

type NewRotaDialogOptions = {
  locations: Array<AccessibleRotaLocation>
  selectedLocation: AccessibleRotaLocation | null
  defaultSourceType?: NewRotaSource
  initialWeekStart?: string
}

type NewRotaDialogProps = NewRotaDialogOptions & {
  triggerLabel: string
  triggerClassName?: string
  triggerIcon?: "plus" | "template"
  disabled?: boolean
}

type NewRotaDialogContentProps = NewRotaDialogOptions & { open: boolean }

export type {
  NewRotaDialogOptions,
  NewRotaDialogProps,
  NewRotaDialogContentProps,
}
