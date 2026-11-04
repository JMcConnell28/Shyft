import { z } from "zod"

// Numeric values and payroll hours cannot contain functions, references or
// separators. Keep their formatting, including negative corrections.
const csvNumericValueSchema = z
  .string()
  .max(32)
  .regex(/^[+-]?\d+(?:\.\d+)?$|^-?\d+:[0-5]\d$/)

export { csvNumericValueSchema }
