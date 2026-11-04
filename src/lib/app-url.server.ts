import "@tanstack/react-start/server-only"

import { getOptionalEnv } from "@/lib/env.server"
import {
  getSafeAppReturnPath,
  isSafeAppReturnPath,
} from "@/lib/app-return-path"

function getAppBaseUrl() {
  return getOptionalEnv("BETTER_AUTH_URL") ?? "http://localhost:3000"
}

function buildAppUrl(path: string) {
  if (!isSafeAppReturnPath(path)) {
    throw new Error("App URLs must use safe app-relative paths.")
  }

  return new URL(path, getAppBaseUrl()).toString()
}

export { buildAppUrl, getAppBaseUrl, getSafeAppReturnPath, isSafeAppReturnPath }
