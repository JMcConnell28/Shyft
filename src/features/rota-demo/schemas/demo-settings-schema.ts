import { z } from "zod"

import { DEMO_MAX_EMPLOYEE_COUNT } from "@/features/rota-demo/constants/demo-settings"

export const demoEmployeeCountSchema = z.preprocess(
  (value) => (typeof value === "string" && !value.trim() ? undefined : value),
  z.coerce
    .number()
    .int("Use a whole number of employees.")
    .min(0, "Use zero or more employees.")
    .max(
      DEMO_MAX_EMPLOYEE_COUNT,
      `Use up to ${DEMO_MAX_EMPLOYEE_COUNT} employees.`
    )
)
