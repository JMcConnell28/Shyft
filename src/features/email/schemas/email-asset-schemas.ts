import { z } from "zod"

const localHostnames = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"])

const emailAssetBaseUrlSchema = z.url().refine(
  (value) => {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()

    return (
      url.protocol === "https:" &&
      !localHostnames.has(hostname) &&
      !hostname.endsWith(".localhost") &&
      !hostname.endsWith(".local") &&
      !url.username &&
      !url.password &&
      !url.port &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    )
  },
  { message: "EMAIL_ASSET_BASE_URL must be a public HTTPS origin." }
)

export { emailAssetBaseUrlSchema }
