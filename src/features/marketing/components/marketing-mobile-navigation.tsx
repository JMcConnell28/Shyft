import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import { CircleHelpIcon, MenuIcon, TagIcon, XIcon } from "lucide-react"

import { navigationFeatures } from "../constants/navigation-features"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const mobileLinks = [
  ...navigationFeatures,
  { href: "/pricing", title: "Pricing", icon: TagIcon },
  { href: "/help", title: "Help Centre", icon: CircleHelpIcon },
] as const

export function MarketingMobileNavigation() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    // Match the lg breakpoint that switches the header to desktop navigation.
    const desktop = window.matchMedia("(min-width: 64rem)")
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false)
    }

    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-11 lg:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <MenuIcon size={20} aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="data-[side=right]:w-[min(85vw,22rem)] motion-reduce:transition-none"
      >
        <SheetHeader className="flex-row items-center justify-between gap-3 border-b px-5 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <SheetTitle className="text-base font-semibold">
            Explore RocketRota
          </SheetTitle>
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
                aria-label="Close navigation"
              />
            }
          >
            <XIcon className="size-5" aria-hidden="true" />
          </SheetClose>
        </SheetHeader>
        <nav
          aria-label="Site navigation"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <ul className="grid gap-1">
            {mobileLinks.map(({ href, title, icon: Icon }) => (
              <li key={href}>
                <Link
                  to={href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:bg-accent"
                >
                  <Icon
                    className="size-[17px] shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
