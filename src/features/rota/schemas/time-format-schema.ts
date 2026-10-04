import { z } from "zod"

const rotaTimeFormatSchema = z.enum(["12h", "24h"])
type RotaTimeFormat = z.infer<typeof rotaTimeFormatSchema>

export { rotaTimeFormatSchema }
export type { RotaTimeFormat }
