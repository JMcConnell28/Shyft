type AppErrorKind =
  | "auth"
  | "permission"
  | "validation"
  | "conflict"
  | "not-found"
  | "unknown"

type AppError = {
  kind: AppErrorKind
  message: string
}

function getErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong.",
) {
  return toAppError(error, fallbackMessage).message
}

function toAppError(
  error: unknown,
  fallbackMessage = "Something went wrong.",
): AppError {
  if (typeof error === "string" && error.trim().length > 0) {
    return buildAppError(error, fallbackMessage)
  }

  if (error instanceof Error) {
    return buildAppError(error.message, fallbackMessage)
  }

  return {
    kind: "unknown",
    message: fallbackMessage,
  }
}

function buildAppError(message: string, fallbackMessage: string): AppError {
  const normalizedMessage = message.trim() || fallbackMessage
  const lowerCasedMessage = normalizedMessage.toLowerCase()
  const kind = inferErrorKind(lowerCasedMessage)

  return {
    kind,
    message: kind === "unknown" ? fallbackMessage : normalizedMessage,
  }
}

function inferErrorKind(message: string): AppErrorKind {
  if (
    message.includes("sign in") ||
    message.includes("unauthorized") ||
    message.includes("verify your email")
  ) {
    return "auth"
  }

  if (
    message.includes("permission") ||
    message.includes("access") ||
    message.includes("forbidden")
  ) {
    return "permission"
  }

  if (
    message.includes("already exists") ||
    message.includes("already in use") ||
    message.includes("already taken")
  ) {
    return "conflict"
  }

  if (
    message.includes("choose ") ||
    message.includes("valid ") ||
    message.includes("invalid") ||
    message.includes("required")
  ) {
    return "validation"
  }

  if (
    message.includes("could not find") ||
    message.includes("not found") ||
    message.includes("not valid anymore") ||
    message.includes("expired")
  ) {
    return "not-found"
  }

  return "unknown"
}

export { getErrorMessage, toAppError }
export type { AppError, AppErrorKind }
