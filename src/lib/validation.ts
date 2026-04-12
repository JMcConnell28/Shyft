import { z } from "zod"

function getZodErrorMessage(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) {
    return undefined
  }

  return result.error.issues[0]?.message ?? "Please review this field."
}

function createZodFieldValidator<TSchema extends z.ZodTypeAny>(schema: TSchema) {
  return ({ value }: { value: unknown }) => {
    const result = schema.safeParse(value)
    return getZodErrorMessage(result)
  }
}

export { createZodFieldValidator, getZodErrorMessage }
