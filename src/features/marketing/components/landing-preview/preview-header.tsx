import { Link } from "@tanstack/react-router"
import { LayoutDashboardIcon, LogInIcon } from "lucide-react"

import { PreviewBrand } from "./preview-brand"
import { PreviewMobileMenu } from "./preview-mobile-menu"
import { PreviewTrialLink } from "./preview-trial-link"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { navigationFeatures } from "@/features/marketing/content"

export function PreviewHeader({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  const AuthIcon = isAuthenticated ? LayoutDashboardIcon : LogInIcon

  return (
    <header className="preview-header preview-container">
      <PreviewBrand />
      <NavigationMenu
        className="preview-desktop-nav"
        aria-label="Main navigation"
      >
        <NavigationMenuList className="gap-5">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-[#18316a] hover:bg-[#edf3ff] focus:bg-[#edf3ff]">
              Features
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-[320px] bg-white p-2 text-[#18316a]">
              {navigationFeatures
                .filter((feature) => feature.href)
                .map((feature) => (
                  <NavigationMenuLink
                    key={feature.title}
                    href={feature.href ?? undefined}
                    className="gap-3 p-3 hover:bg-[#edf3ff] focus:bg-[#edf3ff]"
                  >
                    <feature.icon
                      className="size-5 shrink-0 text-[#325cff]"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-sm font-bold">
                        {feature.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#627394]">
                        {feature.description}
                      </span>
                    </span>
                  </NavigationMenuLink>
                ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/pricing" className="preview-nav-link">
              Pricing
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/help" className="preview-nav-link">
              Help Centre
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="preview-header-actions">
        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          search={isAuthenticated ? undefined : { redirect: "/dashboard" }}
          reloadDocument={isAuthenticated}
          className="preview-button preview-button-secondary preview-login"
          aria-label={isAuthenticated ? "Dashboard" : "Log in"}
        >
          <AuthIcon size={16} aria-hidden="true" />
          <span className="preview-auth-label">
            {isAuthenticated ? "Dashboard" : "Log in"}
          </span>
        </Link>
        <PreviewTrialLink className="preview-header-trial" />
        <PreviewMobileMenu />
      </div>
    </header>
  )
}
