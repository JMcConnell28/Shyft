const validationOrigin = "https://return-path.invalid"

function isSafeAppReturnPath(path: string): boolean {
  if (!path || path.length > 2048 || /[\p{Cc}\s\\]/u.test(path)) return false
  let candidate = path.split(/[?#]/, 1)[0]
  for (let depth = 0; depth < 5; depth++) {
    if (
      !candidate.startsWith("/") ||
      candidate.startsWith("//") ||
      /[\p{Cc}\s\\]/u.test(candidate)
    )
      return false
    const url = new URL(candidate, validationOrigin)
    if (url.origin !== validationOrigin || url.pathname.startsWith("//"))
      return false
    try {
      const decoded = decodeURIComponent(candidate)
      if (decoded === candidate) return true
      candidate = decoded
    } catch {
      return false
    }
  }
  return false
}

function getSafeAppReturnPath(
  path: string | null | undefined,
  fallbackPath: string
): string {
  if (!isSafeAppReturnPath(fallbackPath))
    throw new Error("The fallback must be an internal app path.")
  return path && isSafeAppReturnPath(path) ? path : fallbackPath
}

export { getSafeAppReturnPath, isSafeAppReturnPath }
