import "@tanstack/react-start/server-only"

import { randomUUID } from "node:crypto"

import { getRequiredEnv } from "@/lib/env.server"

function getAppBaseUrl() {
  return getRequiredEnv("BETTER_AUTH_URL").replace(/\/$/, "")
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) {
    return null
  }

  return new Date(value).toISOString()
}

function buildStaffInviteUrl(token: string) {
  return `${getAppBaseUrl()}/join/${token}`
}

function createEmployeeMemberId() {
  return `member-${randomUUID()}`
}

export {
  buildStaffInviteUrl,
  createEmployeeMemberId,
  toIsoString,
}
