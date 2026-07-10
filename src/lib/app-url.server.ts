import "@tanstack/react-start/server-only"

import { getOptionalEnv } from "@/lib/env.server"

function getAppBaseUrl() {
  return getOptionalEnv("BETTER_AUTH_URL") ?? "http://localhost:3000"
}

function isSafeAppReturnPath(path: string) {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("\\") &&
    !/[\u0000-\u001f\u007f]/.test(path)
  )
}

function getSafeAppReturnPath(
  path: string | null | undefined,
  fallbackPath: string,
) {
  if (path && isSafeAppReturnPath(path)) {
    return path
  }

  return fallbackPath
}

function buildAppUrl(path: string) {
  if (!isSafeAppReturnPath(path)) {
    throw new Error("App URLs must use safe app-relative paths.")
  }

  return new URL(path, getAppBaseUrl()).toString()
}

export {
  buildAppUrl,
  getAppBaseUrl,
  getSafeAppReturnPath,
  isSafeAppReturnPath,
}
