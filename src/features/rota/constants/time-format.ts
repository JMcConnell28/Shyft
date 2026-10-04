import type { RotaTimeFormat } from "@/features/rota/schemas/time-format-schema"

const DEFAULT_ROTA_TIME_FORMAT: RotaTimeFormat = "12h"
const rotaTimeFormatOptions = [
  { label: "12-hour (AM/PM)", value: "12h" },
  { label: "24-hour", value: "24h" },
] as const satisfies ReadonlyArray<{ label: string; value: RotaTimeFormat }>

export { DEFAULT_ROTA_TIME_FORMAT, rotaTimeFormatOptions }
