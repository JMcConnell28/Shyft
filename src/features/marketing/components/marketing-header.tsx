import { Link } from "@tanstack/react-router"
import { ArrowRightIcon, LogInIcon } from "lucide-react"

import { navigationFeatures } from "@/features/marketing/content"
import {
  marketingLoginButtonClassName,
  marketingPrimaryButtonClassName,
} from "@/features/marketing/constants/button-styles"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function MarketingHeader({
  activePage = "home",
}: {
  activePage?: "home" | "pricing" | "features"
}) {
  return (
    <header className="flex items-center justify-between gap-4 py-3 sm:py-4">
      <Link to="/" className="flex items-center gap-3">
        <img
          src="/brand/rocketrota-logo.png"
          alt="RocketRota"
          className="h-8 w-auto object-contain"
        />
        <span className="text-xl font-extrabold tracking-tight text-[#16346e]">
          RocketRota
        </span>
      </Link>

      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                "bg-transparent text-sm font-semibold hover:bg-white/50 hover:text-[#16346e] focus:bg-white/50",
                activePage === "features" ? "text-[#16346e]" : "text-[#19356f]",
              )}
            >
              Features
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-[520px] p-2">
              <div className="grid grid-cols-2 gap-1">
                {navigationFeatures.map((feature) => (
                  <NavigationMenuLink
                    key={feature.title}
                    href={feature.href ?? undefined}
                    className="flex gap-3 rounded-xl p-3 hover:bg-[#f4f8ff]"
                  >
                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-[#2c69ff]">
                      <feature.icon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#16346e]">
                        {feature.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#667ba1]">
                        {feature.description}
                      </span>
                    </span>
                  </NavigationMenuLink>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              to="/pricing"
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent text-sm font-semibold hover:bg-white/50 hover:text-[#16346e]",
                activePage === "pricing" ? "text-[#16346e]" : "text-[#19356f]",
              )}
            >
              Pricing
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className="bg-transparent text-sm font-semibold text-[#19356f] hover:bg-white/50 hover:text-[#16346e] focus:bg-white/50"
            >
              Resources
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-[280px] p-2">
              <div className="grid gap-1">
                <NavigationMenuLink
                  href="/help"
                  className="block rounded-xl p-3 hover:bg-[#f4f8ff]"
                >
                  <p className="text-sm font-semibold text-[#16346e]">Help Centre</p>
                  <p className="mt-1 text-xs leading-5 text-[#667ba1]">
                    Quick answers for managers and teams.
                  </p>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <button
              type="button"
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent text-sm font-semibold text-[#19356f] hover:bg-white/50 hover:text-[#16346e]",
              )}
            >
              About
            </button>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          search={{ redirect: "/dashboard" }}
          className={cn(
            buttonVariants({ variant: "pill", size: "lg" }),
            marketingLoginButtonClassName,
          )}
        >
          <LogInIcon className="size-4" />
          Log in
        </Link>
        <Link
          to="/sign-up"
          search={{ redirect: "/dashboard" }}
          className={cn(
            buttonVariants({ size: "lg" }),
            marketingPrimaryButtonClassName,
          )}
        >
          Start free trial
          <ArrowRightIcon className="size-4 transition-transform group-hover/button:translate-x-0.5" />
        </Link>
      </div>
    </header>
  )
}

export { MarketingHeader }
