import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"
import { siteMetadata } from "../constants/site-metadata"
import { siteStructuredData } from "../constants/site-structured-data"
import { createMarketingHead } from "./marketing-head"

const page = {
  path: "/pricing" as const,
  title: "RocketRota Pricing",
  description: "Pricing for RocketRota.",
}

describe("public marketing metadata", () => {
  it("keeps page-specific titles and canonical URLs aligned", () => {
    const head = createMarketingHead({
      ...page,
      path: "/pricing?source=x#plans",
    })
    expect(head.links).toEqual([
      { rel: "canonical", href: "https://rocketrota.com/pricing" },
    ])
    expect(head.meta).toContainEqual({ title: page.title })
    expect(head.meta).toContainEqual({
      property: "og:title",
      content: page.title,
    })
    expect(head.meta).toContainEqual({
      property: "og:url",
      content: "https://rocketrota.com/pricing",
    })
    expect(head.meta).toContainEqual({
      property: "og:site_name",
      content: "RocketRota",
    })
  })

  it("provides the same public HTTPS image to Open Graph and Twitter", () => {
    const head = createMarketingHead(page)
    const image = "https://rocketrota.com/brand/rocketrota-social-preview.png"
    expect(head.meta).toContainEqual({ property: "og:image", content: image })
    expect(head.meta).toContainEqual({ name: "twitter:image", content: image })
    expect(head.meta).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    })
    expect(head.meta).toContainEqual({
      property: "og:image:type",
      content: "image/png",
    })
  })

  it("declares one branded WebSite on the homepage without repeating it on subpages", () => {
    const home = createMarketingHead({
      path: "/",
      title: siteMetadata.title,
      description: siteMetadata.description,
      includeSiteSchema: true,
    })
    expect(home.scripts).toContainEqual({
      type: "application/ld+json",
      children: JSON.stringify(siteStructuredData),
    })
    expect(home.links[0].href).toBe("https://rocketrota.com/")
    expect(
      siteStructuredData["@graph"].filter((node) => node["@type"] === "WebSite")
    ).toMatchObject([{ name: "RocketRota", url: "https://rocketrota.com/" }])
    expect(createMarketingHead(page).scripts).toEqual([])
  })

  it("references existing public artwork with accurate PNG dimensions", async () => {
    const image = await readFile(
      new URL(
        `../../../../public${siteMetadata.socialImage.path}`,
        import.meta.url
      )
    )
    expect(image.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a")
    expect(image.readUInt32BE(16)).toBe(siteMetadata.socialImage.width)
    expect(image.readUInt32BE(20)).toBe(siteMetadata.socialImage.height)
    expect(image.length).toBeLessThan(5_000_000)
    expect(
      (
        await readFile(
          new URL(`../../../../public${siteMetadata.logoPath}`, import.meta.url)
        )
      ).length
    ).toBeGreaterThan(0)
  })
})
