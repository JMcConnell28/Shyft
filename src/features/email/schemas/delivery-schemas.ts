import { z } from "zod"

const emailDeliveryResultSchema = z.object({ id: z.uuid() })

export { emailDeliveryResultSchema }
