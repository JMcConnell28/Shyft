import { z } from "zod"

const searchParamSchema = z.preprocess((value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? "")
  }

  if (value === null || value === undefined) {
    return ""
  }

  return String(value)
}, z.string())

export const clockScanSearchSchema = z
  .object({
    cmac: searchParamSchema,
    picc: searchParamSchema,
    tag: searchParamSchema,
    p: searchParamSchema.optional(),
    t: searchParamSchema.optional(),
  })
  .passthrough()

export type ClockScanSearch = z.infer<typeof clockScanSearchSchema>
