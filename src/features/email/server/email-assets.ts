import "@tanstack/react-start/server-only"

import { emailAssetBaseUrlSchema } from "@/features/email/schemas/email-asset-schemas"
import { getOptionalEnv } from "@/lib/env.server"

type BrandedEmailImageUrls = {
  graphic: string
  logo: string
}

const defaultEmailAssetBaseUrl = "https://rocketrota.com"

function buildBrandedEmailImageUrls(
  assetBaseUrl: string,
  graphicPath: string
): BrandedEmailImageUrls {
  const baseUrl = new URL(emailAssetBaseUrlSchema.parse(assetBaseUrl))

  return {
    graphic: new URL(graphicPath, baseUrl).toString(),
    logo: buildBrandedEmailLogoUrl(assetBaseUrl),
  }
}

function buildBrandedEmailLogoUrl(assetBaseUrl: string): string {
  const baseUrl = new URL(emailAssetBaseUrlSchema.parse(assetBaseUrl))
  return new URL("/pwa/icon-192.png", baseUrl).toString()
}

function getEmailAssetBaseUrl(): string {
  return getOptionalEnv("EMAIL_ASSET_BASE_URL") ?? defaultEmailAssetBaseUrl
}

function getBrandedEmailLogoUrl(): string {
  return buildBrandedEmailLogoUrl(getEmailAssetBaseUrl())
}

function buildVerificationEmailImageUrls(
  assetBaseUrl: string
): BrandedEmailImageUrls {
  return buildBrandedEmailImageUrls(
    assetBaseUrl,
    "/brand/email-verification.png"
  )
}

function getVerificationEmailImageUrls(): BrandedEmailImageUrls {
  return buildVerificationEmailImageUrls(getEmailAssetBaseUrl())
}

function buildOrganizationWelcomeImageUrls(
  assetBaseUrl: string
): BrandedEmailImageUrls {
  return buildBrandedEmailImageUrls(
    assetBaseUrl,
    "/brand/organization-welcome.png"
  )
}

function getOrganizationWelcomeImageUrls(): BrandedEmailImageUrls {
  return buildOrganizationWelcomeImageUrls(getEmailAssetBaseUrl())
}

export {
  buildBrandedEmailLogoUrl,
  buildOrganizationWelcomeImageUrls,
  buildVerificationEmailImageUrls,
  getBrandedEmailLogoUrl,
  getOrganizationWelcomeImageUrls,
  getVerificationEmailImageUrls,
}
