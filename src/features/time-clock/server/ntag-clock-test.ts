import "@tanstack/react-start/server-only"

import { Buffer } from "node:buffer"
import { createDecipheriv } from "node:crypto"

import { AesCmac } from "aes-cmac-js"

import {
  NTAG_CMAC_HEX_LENGTH,
  NTAG_PICC_HEX_LENGTH,
  NTAG_PUBLIC_ID_LENGTH,
} from "@/features/time-clock/constants/ntag-clock"
import type { ClockScanSearch } from "@/features/time-clock/schemas/clock-scan-schemas"
import {
  buildEmployeeClockPageData,
  type ClockSessionContext,
} from "@/features/time-clock/server/queries"
import type {
  ClockCounterClaim,
  ClockScanParts,
  ClockScanVerification,
} from "@/features/time-clock/types/clock-scan"
import type { ClockScanPageData } from "@/features/time-clock/types"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

const hexPattern = /^[0-9A-F]+$/
const tagPattern = /^clk_[0-9A-F]{32}$/

type ClockScanInput = {
  cmac: string
  picc: string
  tag: string
}

type ClockScanKeyContext = {
  aesKeyHex: string
  clockTagId: string
  publicId: string
}

type ParsedPiccParts = Omit<
  ClockScanParts,
  "encryptedPiccHex" | "raw" | "signatureMacHex"
>

async function getClockScanPageData(
  input: ClockScanSearch
): Promise<ClockScanPageData> {
  const { session } = await requireVerifiedSessionOrThrow()
  const parsed = parseClockScanParams(input)

  if (!parsed.ok) {
    return clockScanError("Invalid clock link", parsed.error)
  }

  const verification = await verifyNtagClockScan(parsed.input)

  if (verification.error) {
    return clockScanError("Clock link could not be verified", verification.error)
  }

  if (verification.macValidation.isValid !== true) {
    return clockScanError(
      "Clock link could not be verified",
      "The tag security check failed. Tap the card again and ask a manager for help if it keeps happening."
    )
  }

  if (verification.parts.counterDecimal === null) {
    return clockScanError(
      "Clock link could not be verified",
      "The tag did not include a read counter."
    )
  }

  const supabase = createSupabaseServerClient()
  const claimResult = await supabase.rpc("claim_clock_scan_session", {
    p_cmac_hex: verification.parts.signatureMacHex ?? "",
    p_encrypted_picc_hex: verification.parts.encryptedPiccHex,
    p_picc_counter: verification.parts.counterDecimal,
    p_tag_public_id: parsed.input.tag,
    p_user_id: session.user.id,
  })

  if (claimResult.error) {
    return clockScanError(
      "Clock link could not be used",
      "This tap has already been used, expired, or is not active for your account."
    )
  }

  const scanSession = parseClaimResult(claimResult.data)

  if (!scanSession.ok) {
    return clockScanError("Clock link could not be used", scanSession.error)
  }

  try {
    const clock = await buildEmployeeClockPageData(
      supabase,
      scanSession.context,
      new Date()
    )
    return { status: "ready", clock }
  } catch (error) {
    return clockScanError(
      "Clock page could not load",
      error instanceof Error
        ? error.message
        : "We could not load the clock page for this tap."
    )
  }
}

async function verifyNtagClockScan(
  input: ClockScanInput
): Promise<ClockScanVerification> {
  let keyContext: ClockScanKeyContext

  try {
    keyContext = await getClockScanKeyContext(input.tag)
  } catch (error) {
    return {
      aesKeyHex: "",
      counterClaim: notTrackedCounterClaim(null),
      error:
        error instanceof Error
          ? error.message
          : "We could not load the clock tag key.",
      isFormatValid: false,
      keySource: "database",
      macValidation: emptyMacValidation(normalizeHex(input.cmac)),
      parts: {
        ...emptyParts(normalizeHex(input.picc)),
        signatureMacHex: normalizeHex(input.cmac) || null,
      },
      publicId: input.tag,
    }
  }

  return verifyNtagClockScanWithKey(input, keyContext)
}

function verifyNtagClockScanWithKey(
  input: ClockScanInput,
  keyContext: ClockScanKeyContext
): ClockScanVerification {
  const { error, parts } = parseClockScan(input, keyContext.aesKeyHex)

  if (error) {
    return {
      aesKeyHex: keyContext.aesKeyHex,
      counterClaim: notTrackedCounterClaim(keyContext.clockTagId),
      error,
      isFormatValid: false,
      keySource: "database",
      macValidation: emptyMacValidation(parts.signatureMacHex),
      parts,
      publicId: keyContext.publicId,
    }
  }

  const macValidation = validateMac(parts, keyContext.aesKeyHex)

  return {
    aesKeyHex: keyContext.aesKeyHex,
    counterClaim: macValidation.isValid
      ? {
          clockTagId: keyContext.clockTagId,
          counterDecimal: parts.counterDecimal,
          error: null,
          isTracked: true,
          status: "skipped",
        }
      : notTrackedCounterClaim(keyContext.clockTagId),
    error: macValidation.error,
    isFormatValid: true,
    keySource: "database",
    macValidation,
    parts,
    publicId: keyContext.publicId,
  }
}

function parseClockScanParams(input: ClockScanSearch):
  | { ok: true; input: ClockScanInput }
  | { ok: false; error: string } {
  if (!input.tag && (input.p || input.t)) {
    return {
      ok: false,
      error:
        "This is an old clock link. Tap the configured NTAG 424 card again.",
    }
  }

  const tag = input.tag.trim()
  const picc = normalizeHex(input.picc)
  const cmac = normalizeHex(input.cmac)

  if (tag.length !== NTAG_PUBLIC_ID_LENGTH || !tagPattern.test(tag)) {
    return {
      ok: false,
      error: "The tag id is missing or invalid.",
    }
  }

  if (picc.length !== NTAG_PICC_HEX_LENGTH || !hexPattern.test(picc)) {
    return {
      ok: false,
      error: "The encrypted PICC data is missing or invalid.",
    }
  }

  if (cmac.length !== NTAG_CMAC_HEX_LENGTH || !hexPattern.test(cmac)) {
    return {
      ok: false,
      error: "The CMAC is missing or invalid.",
    }
  }

  return {
    ok: true,
    input: { cmac, picc, tag },
  }
}

function parseClockScan(
  input: ClockScanInput,
  aesKeyHex: string
): {
  error: string | null
  parts: ClockScanParts
} {
  const encryptedPiccHex = normalizeHex(input.picc)
  const signatureMacHex = normalizeHex(input.cmac)

  if (
    encryptedPiccHex.length !== NTAG_PICC_HEX_LENGTH ||
    !hexPattern.test(encryptedPiccHex)
  ) {
    return {
      error: "Expected picc to be 32 hex characters / 16 bytes.",
      parts: emptyParts(encryptedPiccHex),
    }
  }

  if (
    signatureMacHex.length !== NTAG_CMAC_HEX_LENGTH ||
    !hexPattern.test(signatureMacHex)
  ) {
    return {
      error: "Expected cmac to be 16 hex characters / 8 bytes.",
      parts: {
        ...emptyParts(encryptedPiccHex),
        signatureMacHex: signatureMacHex || null,
      },
    }
  }

  const decryptedPicc = decryptPiccData(encryptedPiccHex, aesKeyHex)
  const parsedPicc = parseDecryptedPicc(decryptedPicc)

  if (parsedPicc.error) {
    return {
      error: parsedPicc.error,
      parts: {
        ...emptyParts(encryptedPiccHex),
        decryptedPiccHex: decryptedPicc.toString("hex").toUpperCase(),
        signatureMacHex,
      },
    }
  }

  return {
    error: null,
    parts: {
      ...parsedPicc.parts,
      encryptedPiccHex,
      raw: encryptedPiccHex,
      signatureMacHex,
    },
  }
}

function decryptPiccData(encryptedPiccHex: string, aesKeyHex: string) {
  const decipher = createDecipheriv(
    "aes-128-cbc",
    Buffer.from(aesKeyHex, "hex"),
    Buffer.alloc(16)
  )

  decipher.setAutoPadding(false)

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPiccHex, "hex")),
    decipher.final(),
  ])
}

function parseDecryptedPicc(decryptedPicc: Buffer): {
  error: string | null
  parts: ParsedPiccParts
} {
  const piccDataTag = decryptedPicc[0]

  if (piccDataTag === undefined) {
    return {
      error: "Decrypted PICC data was empty.",
      parts: emptyParsedParts(decryptedPicc),
    }
  }

  const hasUid = (piccDataTag & 0x80) !== 0
  const hasCounter = (piccDataTag & 0x40) !== 0
  let offset = 1
  let uid: Buffer | null = null
  let counter: Buffer | null = null

  if (hasUid) {
    if (decryptedPicc.length < offset + 7) {
      return {
        error:
          "PICC data says UID is present, but fewer than 7 UID bytes exist.",
        parts: emptyParsedParts(decryptedPicc),
      }
    }

    uid = decryptedPicc.subarray(offset, offset + 7)
    offset += 7
  }

  if (hasCounter) {
    if (decryptedPicc.length < offset + 3) {
      return {
        error:
          "PICC data says the read counter is present, but fewer than 3 counter bytes exist.",
        parts: emptyParsedParts(decryptedPicc),
      }
    }

    counter = decryptedPicc.subarray(offset, offset + 3)
    offset += 3
  }

  return {
    error: null,
    parts: {
      counterByteOrder: counter ? "little-endian" : null,
      counterDecimal: counter ? counter.readUintLE(0, 3) : null,
      counterHexLittleEndian: counter
        ? counter.toString("hex").toUpperCase()
        : null,
      decryptedPiccHex: decryptedPicc.toString("hex").toUpperCase(),
      piccDataTagHex: piccDataTag.toString(16).padStart(2, "0").toUpperCase(),
      piccFlags: {
        hasCounter,
        hasUid,
      },
      trailingDataHex: decryptedPicc
        .subarray(offset)
        .toString("hex")
        .toUpperCase(),
      uidHex: uid ? uid.toString("hex").toUpperCase() : null,
    },
  }
}

function validateMac(parts: ClockScanParts, aesKeyHex: string) {
  try {
    const session = getSessionMac(parts, aesKeyHex)
    const inputText = `${parts.encryptedPiccHex}&cmac=`
    const input = Buffer.from(inputText, "utf8")
    const fullCmacHex = calculateCmacHex(
      session.sessionMacKeyHex,
      input.toString("hex")
    )
    const calculatedCmac = getOddBytesHex(Buffer.from(fullCmacHex, "hex"))

    return {
      calculatedCmac,
      error: null,
      fullCmacHex,
      inputHex: input.toString("hex").toUpperCase(),
      inputText,
      isProvided: true,
      isValid: calculatedCmac === parts.signatureMacHex,
      providedCmac: parts.signatureMacHex,
      ...session,
    }
  } catch (error) {
    return {
      calculatedCmac: null,
      error:
        error instanceof Error
          ? error.message
          : "The SDM MAC calculation failed.",
      fullCmacHex: null,
      inputHex: null,
      inputText: null,
      isProvided: true,
      isValid: false,
      providedCmac: parts.signatureMacHex,
      sessionMacKeyHex: null,
      sessionVectorHex: null,
    }
  }
}

async function getClockScanKeyContext(
  publicId: string
): Promise<ClockScanKeyContext> {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("clock_tags")
    .select("id, ntag_aes_key_hex")
    .eq("ntag_public_id", publicId)
    .eq("is_active", true)
    .is("disabled_at", null)
    .not("ntag_aes_key_hex", "is", null)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load the clock tag key.")

  if (!result.data?.ntag_aes_key_hex) {
    throw new Error("That clock tag is not active.")
  }

  return {
    aesKeyHex: result.data.ntag_aes_key_hex,
    clockTagId: result.data.id,
    publicId,
  }
}

function parseClaimResult(value: unknown):
  | { ok: true; context: ClockSessionContext }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "The scan session could not be created." }
  }

  const record = value as Record<string, unknown>

  const scanSessionId = getStringField(record, "scan_session_id", "id")

  if (!scanSessionId) {
    return { ok: false, error: "The scan session could not be created." }
  }

  return {
    ok: true,
    context: {
      action: record.action === "clock_out" ? "clock_out" : "clock_in",
      clockTagId: getStringField(record, "clock_tag_id", "clockTagId") ?? "",
      employeeId: getStringField(record, "employee_id", "employeeId") ?? "",
      expiresAt: getStringField(record, "expires_at", "expiresAt") ?? "",
      id: scanSessionId,
      locationId: getStringField(record, "location_id", "locationId") ?? "",
      organizationId: getStringField(record, "organization_id", "organizationId")
        ? getStringField(record, "organization_id", "organizationId")
        : null,
      userId: getStringField(record, "user_id", "userId") ?? "",
    },
  }
}

function getStringField(
  record: Record<string, unknown>,
  snakeCaseKey: string,
  camelCaseKey: string
) {
  const value = record[snakeCaseKey] ?? record[camelCaseKey]
  return typeof value === "string" ? value : null
}

function getSessionMac(parts: ClockScanParts, aesKeyHex: string) {
  if (!parts.uidHex || !parts.counterHexLittleEndian) {
    throw new Error("UID and read counter are required to calculate SDM MAC.")
  }

  const sessionVectorHex = [
    "3CC300010080",
    parts.uidHex,
    parts.counterHexLittleEndian,
  ].join("")
  const sessionMacKeyHex = calculateCmacHex(aesKeyHex, sessionVectorHex)

  return {
    sessionMacKeyHex,
    sessionVectorHex,
  }
}

function getOddBytesHex(buffer: Buffer): string {
  return Buffer.from(buffer.filter((_, index) => index % 2 !== 0))
    .toString("hex")
    .toUpperCase()
}

function calculateCmacHex(keyHex: string, inputHex: string): string {
  const cmac = new AesCmac(`0x${keyHex}`)
  const bitArray = cmac.generateCmac(`0x${inputHex}`) as number[]

  return bitArray
    .map((word) => (word >>> 0).toString(16).padStart(8, "0"))
    .join("")
    .toUpperCase()
}

function emptyParts(raw: string): ClockScanParts {
  return {
    counterByteOrder: null,
    counterDecimal: null,
    counterHexLittleEndian: null,
    decryptedPiccHex: "",
    encryptedPiccHex: raw,
    piccDataTagHex: null,
    piccFlags: null,
    raw,
    signatureMacHex: null,
    trailingDataHex: null,
    uidHex: null,
  }
}

function emptyParsedParts(decryptedPicc: Buffer): ParsedPiccParts {
  return {
    counterByteOrder: null,
    counterDecimal: null,
    counterHexLittleEndian: null,
    decryptedPiccHex: decryptedPicc.toString("hex").toUpperCase(),
    piccDataTagHex: null,
    piccFlags: null,
    trailingDataHex: null,
    uidHex: null,
  }
}

function emptyMacValidation(providedCmac: string | null) {
  return {
    calculatedCmac: null,
    error: null,
    fullCmacHex: null,
    inputHex: null,
    inputText: null,
    isProvided: providedCmac !== null && providedCmac.length > 0,
    isValid: null,
    providedCmac,
    sessionMacKeyHex: null,
    sessionVectorHex: null,
  }
}

function notTrackedCounterClaim(
  clockTagId: string | null
): ClockCounterClaim {
  return {
    clockTagId,
    counterDecimal: null,
    error: null,
    isTracked: false,
    status: "not_tracked",
  }
}

function clockScanError(title: string, message: string): ClockScanPageData {
  return {
    message,
    status: "error",
    title,
  }
}

function normalizeHex(value: string) {
  return value.trim().toUpperCase()
}

export {
  getClockScanPageData,
  parseClockScanParams,
  verifyNtagClockScan,
  verifyNtagClockScanWithKey,
}
