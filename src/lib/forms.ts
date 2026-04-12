import type { AnyFieldApi } from "@tanstack/react-form"

function getFieldError(field: AnyFieldApi) {
  const firstError = field.state.meta.errors[0]

  if (!firstError) {
    return undefined
  }

  if (typeof firstError === "string") {
    return firstError
  }

  if (
    typeof firstError === "object" &&
    "message" in firstError &&
    typeof firstError.message === "string"
  ) {
    return firstError.message
  }

  return undefined
}

export { getFieldError }
