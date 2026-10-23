import type { ReactNode } from "react"

import "../styles/landing-preview.css"
import "../styles/landing-preview-sections.css"
import "../styles/landing-preview-navigation.css"
import "../styles/landing-preview-responsive.css"

function LandingPageShell({ children }: { children: ReactNode }) {
  return <div className="landing-preview">{children}</div>
}

export { LandingPageShell }
