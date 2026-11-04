// @ts-check
import { z } from "zod"

const databaseConnectionUrlSchema = z
  .string()
  .url()
  .refine((value) => /^postgres(?:ql)?:\/\//i.test(value))

export { databaseConnectionUrlSchema }
