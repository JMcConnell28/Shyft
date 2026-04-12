import { z } from "zod"

import { shiftTimePattern } from "@/features/rota/utils/shift-time"

const createShiftSchema = z
  .object({
    dayId: z.string().min(1, "Choose a day."),
    zoneId: z.string().min(1, "Choose a zone."),
    startTime: z
      .string()
      .regex(shiftTimePattern, "Choose a valid start time."),
    endTime: z
      .string()
      .regex(shiftTimePattern, "Choose a valid finish time."),
  })
  .refine((value) => value.endTime > value.startTime, {
    message: "Finish time must be after the start time.",
    path: ["endTime"],
  })

type CreateShiftSchema = z.infer<typeof createShiftSchema>

export { createShiftSchema }
export type { CreateShiftSchema }
