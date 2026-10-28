import { Link } from "@tanstack/react-router"
import { ArrowUpRightIcon } from "lucide-react"

import { navigationFeatures } from "../constants/navigation-features"
import type { MarketingFeatureSlug } from "../types"

export function RelatedFeatures({
  current,
}: {
  current: MarketingFeatureSlug
}) {
  return (
    <section
      className="marketing-related preview-container"
      aria-labelledby="related-features-title"
    >
      <div>
        <p className="marketing-eyebrow">Better together</p>
        <h2 id="related-features-title">One connected working week.</h2>
      </div>
      <nav
        className="marketing-feature-links"
        aria-label="Explore more features"
      >
        {navigationFeatures
          .filter((feature) => feature.href !== `/features/${current}`)
          .map((feature) => (
            <Link key={feature.href} to={feature.href}>
              <feature.icon size={19} aria-hidden="true" />
              <span>{feature.title}</span>
              <ArrowUpRightIcon size={17} aria-hidden="true" />
            </Link>
          ))}
      </nav>
    </section>
  )
}
