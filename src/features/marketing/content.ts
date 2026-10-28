import { schedulingFeaturePages } from "./data/scheduling-features"
import { teamFeaturePages } from "./data/team-features"
import type { MarketingFeaturePageContent, MarketingFeatureSlug } from "./types"

const marketingFeaturePages = {
  ...schedulingFeaturePages,
  ...teamFeaturePages,
} satisfies Record<MarketingFeatureSlug, MarketingFeaturePageContent>

export { marketingFeaturePages }
export { navigationFeatures } from "./constants/navigation-features"
export type { MarketingFeatureSlug } from "./types"
