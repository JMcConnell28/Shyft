import type { z } from "zod"
import type { clockReminderSchema } from "@/features/time-clock/schemas/clock-automation-schemas"

type ClockReminder = z.infer<typeof clockReminderSchema>

export type { ClockReminder }
