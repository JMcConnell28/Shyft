import "@tanstack/react-start/server-only"

import { emailAssetBaseUrlSchema } from "@/features/email/schemas/email-asset-schemas"
import { getOptionalEnv } from "@/lib/env.server"

type VerificationEmailImageUrls = {
  graphic: string
  logo: string
}

const defaultEmailAssetBaseUrl = "https://rocketrota.com"

function buildVerificationEmailImageUrls(
  assetBaseUrl: string
): VerificationEmailImageUrls {
  const baseUrl = new URL(emailAssetBaseUrlSchema.parse(assetBaseUrl))

  return {
    graphic: new URL("/brand/email-verification.png", baseUrl).toString(),
    logo: new URL("/pwa/icon-192.png", baseUrl).toString(),
  }
}

function getVerificationEmailImageUrls(): VerificationEmailImageUrls {
  return buildVerificationEmailImageUrls(
    getOptionalEnv("EMAIL_ASSET_BASE_URL") ?? defaultEmailAssetBaseUrl
  )
}

export { buildVerificationEmailImageUrls, getVerificationEmailImageUrls }
