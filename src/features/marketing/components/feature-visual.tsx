import * as React from "react"
import type { ComponentType } from "react"

import type { MarketingFeatureSlug } from "../types"
import { rotaScreenshot } from "../constants/feature-assets"
import { ProductScreenshotFrame } from "./product-screenshot-frame"
import { AttendancePreview } from "./feature-previews/attendance-preview"
import { TimesheetsPreview } from "./feature-previews/timesheets-preview"
import { TeamPreview } from "./feature-previews/team-preview"
import { DashboardPreview } from "./feature-previews/dashboard-preview"
import { UpdatesPreview } from "./feature-previews/updates-preview"

const RotaPlanningFeaturePreview = React.lazy(
  () => import("@/features/rota-demo/components/rota-planning-feature-preview")
)

function RotaPreview() {
  return (
    <figure>
      <ProductScreenshotFrame
        src={rotaScreenshot.src}
        alt={rotaScreenshot.alt}
        className="marketing-rota-preview"
        fallback={
          <React.Suspense
            fallback={
              <p className="p-8 text-center">Loading the example rota…</p>
            }
          >
            <RotaPlanningFeaturePreview />
          </React.Suspense>
        }
      />
      <figcaption className="marketing-visual-caption">
        Example rota with fictional staff and business details.
      </figcaption>
    </figure>
  )
}

const previews: Record<MarketingFeatureSlug, ComponentType> = {
  "rota-planning": RotaPreview,
  "time-tracking": AttendancePreview,
  timesheets: TimesheetsPreview,
  "team-management": TeamPreview,
  "manager-dashboard": DashboardPreview,
  "staff-updates": UpdatesPreview,
}

export function FeatureVisual({ feature }: { feature: MarketingFeatureSlug }) {
  const Preview = previews[feature]
  return <Preview />
}
