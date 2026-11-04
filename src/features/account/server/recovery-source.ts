import "@tanstack/react-start/server-only"

import ipaddr from "ipaddr.js"

import { recoveryRequestAddressSchema } from "@/features/account/schemas/password-recovery-schemas"
import { getOptionalEnv } from "@/lib/env.server"

function normalizeRecoveryAddress(value: string | undefined): string | null {
  if (!value || value.includes("%") || !ipaddr.isValid(value)) return null
  let address = ipaddr.parse(value)
  if (address.kind() === "ipv6" && address instanceof ipaddr.IPv6) {
    if (address.isIPv4MappedAddress()) address = address.toIPv4Address()
    else {
      // One source budget per IPv6 /64, including equivalent spellings.
      const bytes = address
        .toByteArray()
        .map((byte, index) => (index < 8 ? byte : 0))
      return `${ipaddr.fromByteArray(bytes).toString()}/64`
    }
  }
  return address.toString()
}

function getRecoverySource(request: Request): string | null {
  // Only configure a header when the ingress overwrites it and the app origin
  // cannot be reached directly. Never trust arbitrary X-Forwarded-For by default.
  const trustedHeader = getOptionalEnv("AUTH_RECOVERY_TRUSTED_IP_HEADER")
  if (trustedHeader && /^[\w-]+$/.test(trustedHeader)) {
    const address = normalizeRecoveryAddress(
      request.headers.get(trustedHeader) ?? undefined
    )
    if (address) return address
  }
  const parsed = recoveryRequestAddressSchema.safeParse(request)
  if (!parsed.success) return null
  return (
    normalizeRecoveryAddress(parsed.data.context?.clientAddress) ??
    normalizeRecoveryAddress(parsed.data.ip)
  )
}

export { getRecoverySource, normalizeRecoveryAddress }
