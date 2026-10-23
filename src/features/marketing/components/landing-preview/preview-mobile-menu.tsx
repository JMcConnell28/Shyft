import { MenuIcon } from "lucide-react"

import { PreviewTrialLink } from "./preview-trial-link"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { navigationFeatures } from "@/features/marketing/content"

export function PreviewMobileMenu() {
  return (
    <Sheet>
      <SheetTrigger
        className="preview-menu-trigger"
        aria-label="Open navigation"
      >
        <MenuIcon size={21} aria-hidden="true" />
      </SheetTrigger>
      <SheetContent className="landing-preview preview-mobile-panel w-[min(340px,90vw)] bg-[#f8fbff] text-[#18316a]">
        <SheetHeader>
          <SheetTitle className="text-xl font-extrabold text-[#18316a]">
            RocketRota
          </SheetTitle>
          <SheetDescription className="text-[#627394]">
            Your team. Your time. Your week.
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="preview-mobile-links">
          {navigationFeatures
            .filter((feature) => feature.href)
            .map((feature) => (
              <a key={feature.title} href={feature.href ?? undefined}>
                <feature.icon size={18} aria-hidden="true" />
                {feature.title}
              </a>
            ))}
          <a href="/pricing">Pricing</a>
          <a href="/help">Help Centre</a>
        </nav>
        <div className="px-6 pt-4">
          <PreviewTrialLink />
        </div>
      </SheetContent>
    </Sheet>
  )
}
