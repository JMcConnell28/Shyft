import { siteMetadata } from "../constants/site-metadata"
import { siteStructuredData } from "../constants/site-structured-data"
import type { ComponentProps } from "react"

type MarketingHeadInput = {
  path: `/${string}`
  title: string
  description: string
  includeSiteSchema?: boolean
}
type MarketingHead = {
  meta: Array<ComponentProps<"meta">>
  links: Array<{ rel: "canonical"; href: string }>
  scripts: Array<ComponentProps<"script">>
}

function createMarketingHead({
  path,
  title,
  description,
  includeSiteSchema = false,
}: MarketingHeadInput): MarketingHead {
  const canonical = new URL(path, siteMetadata.origin)
  canonical.search = ""
  canonical.hash = ""
  const image = new URL(siteMetadata.socialImage.path, siteMetadata.origin).href

  return {
    links: [{ rel: "canonical", href: canonical.href }],
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: siteMetadata.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical.href },
      { property: "og:locale", content: "en_GB" },
      { property: "og:image", content: image },
      { property: "og:image:secure_url", content: image },
      { property: "og:image:type", content: siteMetadata.socialImage.type },
      {
        property: "og:image:width",
        content: String(siteMetadata.socialImage.width),
      },
      {
        property: "og:image:height",
        content: String(siteMetadata.socialImage.height),
      },
      { property: "og:image:alt", content: siteMetadata.socialImage.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: siteMetadata.socialImage.alt },
    ],
    scripts: includeSiteSchema
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify(siteStructuredData).replaceAll(
              "<",
              "\\u003c"
            ),
          },
        ]
      : [],
  }
}

export { createMarketingHead }
