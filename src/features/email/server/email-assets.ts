import "@tanstack/react-start/server-only"

import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { emailAssetBaseUrlSchema } from "@/features/email/schemas/email-asset-schemas"
import { getOptionalEnv } from "@/lib/env.server"

type VerificationEmailImageUrls = {
  graphic: string
  wordmark: string
}

const defaultEmailAssetBaseUrl = "https://rocketrota.com"

let verificationEmailFontDataUrlPromise: Promise<string> | undefined

function buildVerificationEmailImageUrls(
  assetBaseUrl: string
): VerificationEmailImageUrls {
  const baseUrl = new URL(emailAssetBaseUrlSchema.parse(assetBaseUrl))

  return {
    graphic: new URL("/brand/email-verification.png", baseUrl).toString(),
    wordmark: new URL("/brand/rocketrota-wordmark.png", baseUrl).toString(),
  }
}

function getVerificationEmailImageUrls(): VerificationEmailImageUrls {
  return buildVerificationEmailImageUrls(
    getOptionalEnv("EMAIL_ASSET_BASE_URL") ?? defaultEmailAssetBaseUrl
  )
}

function getVerificationEmailFontDataUrl(): Promise<string> {
  verificationEmailFontDataUrlPromise ??= readFile(
    resolve(process.cwd(), "public", "fonts/manrope-latin-variable.woff2")
  )
    .then((content) => `data:font/woff2;base64,${content.toString("base64")}`)
    .catch((error: unknown) => {
      verificationEmailFontDataUrlPromise = undefined
      throw error
    })

  return verificationEmailFontDataUrlPromise
}

export {
  buildVerificationEmailImageUrls,
  getVerificationEmailFontDataUrl,
  getVerificationEmailImageUrls,
}
