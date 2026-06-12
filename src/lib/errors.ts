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
  const message = extractErrorMessage(error)

  if (message) {
    return buildAppError(message, fallbackMessage)
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
    message:
      kind === "unknown"
        ? getUnknownErrorMessage(normalizedMessage, fallbackMessage)
        : normalizedMessage,
  }
}

function extractErrorMessage(error: unknown): string | null {
  if (typeof error === "string" && error.trim().length > 0) {
    return error
  }

  if (error instanceof Error) {
    return (
      error.message ||
      extractErrorMessage((error as Error & { cause?: unknown }).cause)
    )
  }

  if (!isRecord(error)) {
    return null
  }

  const directMessage = readMessageValue(error.message)

  if (directMessage) {
    return directMessage
  }

  const nestedKeys = ["error", "cause", "data", "details", "detail", "reason"] as const

  for (const key of nestedKeys) {
    const nestedMessage = readMessageValue(error[key])

    if (nestedMessage) {
      return nestedMessage
    }
  }

  return null
}

function readMessageValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value
  }

  if (value instanceof Error) {
    return value.message || extractErrorMessage(value.cause)
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const itemMessage = readMessageValue(item)

      if (itemMessage) {
        return itemMessage
      }
    }

    return null
  }

  if (isRecord(value)) {
    return extractErrorMessage(value)
  }

  return null
}

function getUnknownErrorMessage(message: string, fallbackMessage: string) {
  const technicalPatterns = [
    "server function error",
    "failed to fetch",
    "networkerror",
    "unexpected end of json input",
  ]

  return technicalPatterns.some((pattern) => message.toLowerCase().includes(pattern))
    ? fallbackMessage
    : message
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export { getErrorMessage, toAppError }
export type { AppError, AppErrorKind }
