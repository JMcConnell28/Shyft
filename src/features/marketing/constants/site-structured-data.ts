import { siteMetadata } from "./site-metadata"

const homeUrl = `${siteMetadata.origin}/`
const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${homeUrl}#website`,
      name: siteMetadata.name,
      url: homeUrl,
      publisher: { "@id": `${homeUrl}#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${homeUrl}#organization`,
      name: siteMetadata.name,
      url: homeUrl,
      logo: new URL(siteMetadata.logoPath, homeUrl).href,
    },
  ],
} as const

export { siteStructuredData }
