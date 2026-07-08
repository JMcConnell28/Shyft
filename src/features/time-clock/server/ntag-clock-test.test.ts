import { describe, expect, it } from "vitest"

import {
  NTAG_CMAC_OFFSET_PLACEHOLDER,
  NTAG_PICC_OFFSET_PLACEHOLDER,
  NTAG_PUBLIC_ID_LENGTH,
} from "@/features/time-clock/constants/ntag-clock"
import { verifyNtagClockScanWithKey } from "@/features/time-clock/server/ntag-clock-test"

describe("verifyNtagClockScan", () => {
  const keyContext = {
    aesKeyHex: "00000000000000000000000000000000",
    clockTagId: "test-tag-id",
    publicId: "clk_00000000000000000000000000000000",
  }

  it("keeps generated tag setup fields at fixed offset lengths", () => {
    expect(NTAG_PUBLIC_ID_LENGTH).toBe(36)
    expect(NTAG_PICC_OFFSET_PLACEHOLDER).toHaveLength(32)
    expect(NTAG_CMAC_OFFSET_PLACEHOLDER).toHaveLength(16)
  })

  it("validates the configured SDM URL CMAC input", async () => {
    const result = verifyNtagClockScanWithKey({
      cmac: "43CC1F21B971D887",
      picc: "B22FCE3B948CCD05BAB2B6AB0D219C1C",
      tag: keyContext.publicId,
    }, keyContext)

    expect(result.error).toBeNull()
    expect(result.isFormatValid).toBe(true)
    expect(result.parts.decryptedPiccHex).toBe(
      "C7048351E2C11B90190000137B4018DF"
    )
    expect(result.parts.uidHex).toBe("048351E2C11B90")
    expect(result.parts.counterHexLittleEndian).toBe("190000")
    expect(result.parts.counterDecimal).toBe(25)
    expect(result.parts.piccFlags).toEqual({
      hasCounter: true,
      hasUid: true,
    })
    expect(result.macValidation.sessionVectorHex).toBe(
      "3CC300010080048351E2C11B90190000"
    )
    expect(result.macValidation.inputText).toBe(
      "B22FCE3B948CCD05BAB2B6AB0D219C1C&cmac="
    )
    expect(result.macValidation.calculatedCmac).toBe("43CC1F21B971D887")
    expect(result.macValidation.providedCmac).toBe("43CC1F21B971D887")
    expect(result.macValidation.isValid).toBe(true)
    expect(result.counterClaim.status).toBe("skipped")
  })

  it("rejects malformed encrypted PICC data", async () => {
    const result = verifyNtagClockScanWithKey({
      cmac: "43CC1F21B971D887",
      picc: "not-hex",
      tag: keyContext.publicId,
    }, keyContext)

    expect(result.isFormatValid).toBe(false)
    expect(result.error).toBe("Expected picc to be 32 hex characters / 16 bytes.")
  })

  it("requires a valid cmac parameter", async () => {
    const result = verifyNtagClockScanWithKey({
      cmac: "",
      picc: "B22FCE3B948CCD05BAB2B6AB0D219C1C",
      tag: keyContext.publicId,
    }, keyContext)

    expect(result.isFormatValid).toBe(false)
    expect(result.error).toBe(
      "Expected cmac to be 16 hex characters / 8 bytes."
    )
  })
})
