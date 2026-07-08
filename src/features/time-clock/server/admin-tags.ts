import "@tanstack/react-start/server-only"

import { createHash, randomBytes } from "node:crypto"

import type { ClockTagSetupData } from "@/features/time-clock/types"
import {
  NTAG_PUBLIC_ID_PREFIX,
  NTAG_PUBLIC_ID_RANDOM_BYTES,
} from "@/features/time-clock/constants/ntag-clock"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"
import { getOptionalEnv } from "@/lib/env.server"

type AdminClockTagLocation = {
  id: string
  name: string
  organizationId: string | null
  organizationName: string | null
}

type AdminClockTagsPageData = {
  locations: Array<AdminClockTagLocation>
  tags: Array<ClockTagSetupData & { locationId: string }>
}

async function getAdminClockTagsPageData(input: {
  userId: string
}): Promise<AdminClockTagsPageData> {
  await requireAdminUser(input.userId)
  const supabase = createSupabaseServerClient()

  const [locationsResult, organizationsResult, tagsResult] = await Promise.all([
    supabase
      .from("locations")
      .select("id, name, organization_id")
      .order("name", { ascending: true }),
    supabase.from("organization").select("id, name"),
    supabase
      .from("clock_tags")
      .select(
        "id, location_id, label, ntag_public_id, ntag_aes_key_hex, ntag_last_seen_counter"
      )
      .not("ntag_public_id", "is", null)
      .order("created_at", { ascending: false }),
  ])

  assertSupabaseSuccess(locationsResult.error, "We could not load locations.")
  assertSupabaseSuccess(
    organizationsResult.error,
    "We could not load organizations."
  )
  assertSupabaseSuccess(tagsResult.error, "We could not load clock tags.")

  const organizationNameById = new Map(
    (organizationsResult.data ?? []).map((organization) => [
      organization.id,
      organization.name,
    ])
  )

  return {
    locations: (locationsResult.data ?? []).map((location) => ({
      id: location.id,
      name: location.name,
      organizationId: location.organization_id,
      organizationName: location.organization_id
        ? organizationNameById.get(location.organization_id) ?? null
        : null,
    })),
    tags: (tagsResult.data ?? [])
      .filter((tag) => tag.ntag_public_id && tag.ntag_aes_key_hex)
      .map((tag) => ({
        id: tag.id,
        aesKeyHex: tag.ntag_aes_key_hex ?? "",
        label: tag.label,
        lastSeenCounter: tag.ntag_last_seen_counter,
        locationId: tag.location_id,
        publicId: tag.ntag_public_id ?? "",
      })),
  }
}

async function generateAdminClockTagSetup(input: {
  locationId: string
  userId: string
}): Promise<ClockTagSetupData & { locationId: string }> {
  const session = await requireAdminUser(input.userId)
  const supabase = createSupabaseServerClient()

  const locationResult = await supabase
    .from("locations")
    .select("id, organization_id")
    .eq("id", input.locationId)
    .maybeSingle()

  assertSupabaseSuccess(locationResult.error, "We could not load that location.")
  const location = getRequiredSupabaseRow(
    locationResult.data,
    "Choose a valid location."
  )
  const publicId = generateNtagPublicId()
  const aesKeyHex = randomBytes(16).toString("hex").toUpperCase()
  const legacyToken = randomBytes(24).toString("base64url")

  const tagResult = await supabase
    .from("clock_tags")
    .insert({
      created_by: session.user.id,
      is_active: true,
      label: "NTAG 424 clock tag",
      location_id: location.id,
      ntag_aes_key_hex: aesKeyHex,
      ntag_last_seen_counter: 0,
      ntag_public_id: publicId,
      organization_id: location.organization_id,
      token_hash: hashClockToken(legacyToken),
    })
    .select(
      "id, location_id, label, ntag_public_id, ntag_aes_key_hex, ntag_last_seen_counter"
    )
    .single()

  assertSupabaseSuccess(tagResult.error, "We could not generate tag setup data.")
  const tag = getRequiredSupabaseRow(
    tagResult.data,
    "We could not generate tag setup data."
  )

  return {
    id: tag.id,
    aesKeyHex: tag.ntag_aes_key_hex ?? "",
    label: tag.label,
    lastSeenCounter: tag.ntag_last_seen_counter,
    locationId: tag.location_id,
    publicId: tag.ntag_public_id ?? "",
  }
}

async function requireAdminUser(userId: string) {
  const { session } = await requireVerifiedSessionOrThrow()

  if (session.user.id !== userId) {
    throw new Error("Your admin session is no longer valid.")
  }

  const allowedEmails = getAdminEmails()

  if (!allowedEmails.has(session.user.email.toLowerCase())) {
    throw new Error("You do not have access to this admin page.")
  }

  return session
}

function getAdminEmails() {
  return new Set(
    (getOptionalEnv("ADMIN_EMAILS") ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

function generateNtagPublicId() {
  return `${NTAG_PUBLIC_ID_PREFIX}${randomBytes(NTAG_PUBLIC_ID_RANDOM_BYTES)
    .toString("hex")
    .toUpperCase()}`
}

function hashClockToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export {
  generateAdminClockTagSetup,
  getAdminClockTagsPageData,
  requireAdminUser,
}
export type { AdminClockTagLocation, AdminClockTagsPageData }
