import { useRef } from "react"
import { Link } from "@tanstack/react-router"
import { MenuIcon } from "lucide-react"

import { navigationFeatures } from "../constants/navigation-features"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MarketingMobileNavigation() {
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        ref={triggerRef}
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-11 lg:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <MenuIcon size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" finalFocus={triggerRef}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Explore RocketRota</DropdownMenuLabel>
          {navigationFeatures.map((feature) => (
            <DropdownMenuItem
              key={feature.href}
              className="min-h-11"
              render={<Link to={feature.href} />}
            >
              <feature.icon size={17} />
              {feature.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="min-h-11" render={<Link to="/pricing" />}>
          Pricing
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-11" render={<Link to="/help" />}>
          Help Centre
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
