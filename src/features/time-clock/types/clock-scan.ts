export type ClockPiccFlags = {
  hasCounter: boolean
  hasUid: boolean
}

export type ClockScanParts = {
  counterByteOrder: "little-endian" | null
  counterDecimal: number | null
  counterHexLittleEndian: string | null
  decryptedPiccHex: string
  encryptedPiccHex: string
  piccDataTagHex: string | null
  piccFlags: ClockPiccFlags | null
  raw: string
  signatureMacHex: string | null
  trailingDataHex: string | null
  uidHex: string | null
}

export type ClockMacValidation = {
  calculatedCmac: string | null
  error: string | null
  fullCmacHex: string | null
  inputHex: string | null
  inputText: string | null
  isProvided: boolean
  isValid: boolean | null
  providedCmac: string | null
  sessionMacKeyHex: string | null
  sessionVectorHex: string | null
}

export type ClockCounterClaim = {
  clockTagId: string | null
  counterDecimal: number | null
  error: string | null
  isTracked: boolean
  status: "already_used" | "claimed" | "error" | "not_tracked" | "skipped"
}

export type ClockScanVerification = {
  aesKeyHex: string
  counterClaim: ClockCounterClaim
  error: string | null
  isFormatValid: boolean
  keySource: "database" | "test"
  macValidation: ClockMacValidation
  parts: ClockScanParts
  publicId: string | null
}
