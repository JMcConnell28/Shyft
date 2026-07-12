"use client"

import { Link } from "@tanstack/react-router"
import {
  Building2Icon,
  CalendarRangeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinnedIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type SettingsRoute =
  | "/w/$workspaceSlug/settings/general"
  | "/w/$workspaceSlug/settings/locations"
  | "/w/$workspaceSlug/settings/clocking"
  | "/w/$workspaceSlug/settings/company"
  | "/w/$workspaceSlug/settings/rota"
  | "/w/$workspaceSlug/settings/team"
  | "/w/$workspaceSlug/settings/billing"

type SettingsNavItem = {
  to: SettingsRoute
  label: string
  description: string
  icon: typeof Settings2Icon
  organizationOnly?: boolean
}

const workspaceSettingsNavItems: Array<SettingsNavItem> = [
  {
    to: "/w/$workspaceSlug/settings/general",
    label: "General",
    description: "Workspace details and operating defaults.",
    icon: Settings2Icon,
  },
  {
    to: "/w/$workspaceSlug/settings/locations",
    label: "Locations",
    description: "Locations, opening hours, and closing estimates.",
    icon: MapPinnedIcon,
    organizationOnly: true,
  },
  {
    to: "/w/$workspaceSlug/settings/rota",
    label: "Rota",
    description: "Zones, templates, and planning setup.",
    icon: CalendarRangeIcon,
  },
  {
    to: "/w/$workspaceSlug/settings/company",
    label: "Company",
    description: "Employees, roles, pay, and location activity.",
    icon: Building2Icon,
  },
  {
    to: "/w/$workspaceSlug/settings/team",
    label: "Team",
    description: "Staff groups used when building rotas.",
    icon: UsersIcon,
  },
  {
    to: "/w/$workspaceSlug/settings/clocking",
    label: "Clocking",
    description: "Clock stations and pay rules.",
    icon: ClockIcon,
  },
  {
    to: "/w/$workspaceSlug/settings/billing",
    label: "Billing",
    description: "Plan, payment method, and invoices.",
    icon: CreditCardIcon,
  },
]

function SettingsLayout({
  workspaceSlug,
  workspaceType,
  activePath,
  contentOnly = false,
  children,
}: {
  workspaceSlug: string
  workspaceType?: "location" | "organization"
  activePath: string
  contentOnly?: boolean
  children: React.ReactNode
}) {
  const navItems = workspaceSettingsNavItems.filter(
    (item) => !item.organizationOnly || workspaceType === "organization"
  )
  const settingsRootPath = `/w/${workspaceSlug}/settings`
  const isCategoryIndex = activePath === settingsRootPath
  const activeItem =
    navItems.find((item) => {
      const targetPath = item.to.replace("$workspaceSlug", workspaceSlug)
      return (
        activePath === targetPath || activePath.startsWith(`${targetPath}/`)
      )
    }) ?? navItems[0]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col bg-[#f7f8fb] px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
      <div className="md:grid md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden pr-6 md:block lg:pr-8">
          <div className="sticky top-6">
            <div className="mb-7 px-2.5">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                RocketRota
              </p>
              <h2 className="mt-2 text-lg leading-tight font-semibold tracking-tight">
                Workspace settings
              </h2>
            </div>
            <SettingsNavigation
              activePath={activePath}
              items={navItems}
              workspaceSlug={workspaceSlug}
            />
          </div>
        </aside>

        <main className="min-w-0 md:border-l md:border-[#dfe5f0] md:pl-8 lg:pl-10">
          <MobileSettingsIndex
            className={cn(!isCategoryIndex && "hidden")}
            items={navItems}
            workspaceSlug={workspaceSlug}
          />

          <div className={cn(isCategoryIndex ? "hidden md:block" : "block")}>
            {!contentOnly ? (
              <>
                <MobileSettingsDetailHeader
                  activePath={activePath}
                  activeItem={activeItem}
                  workspaceSlug={workspaceSlug}
                />
                <header className="mb-5 hidden rounded-[14px] border border-[#dfe5f0] bg-card px-4 py-3 shadow-[0_8px_24px_rgba(30,50,96,0.045)] md:block">
                  <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-[#11245a]">
                    {activeItem.label}
                  </h1>
                  <p className="mt-0.5 max-w-2xl text-xs font-medium text-[#7a86a4]">
                    {activeItem.description}
                  </p>
                </header>
              </>
            ) : null}
            <div className="settings-content min-w-0 [&_[data-slot=card-content]]:px-4 [&_[data-slot=card-content]]:py-4 [&_[data-slot=card-header]]:min-h-14 [&_[data-slot=card-header]]:rounded-none [&_[data-slot=card-header]]:border-b [&_[data-slot=card-header]]:border-[#edf0f6] [&_[data-slot=card-header]]:px-4 [&_[data-slot=card-header]]:py-3 [&_[data-slot=card]]:gap-0 [&_[data-slot=card]]:overflow-hidden [&_[data-slot=card]]:rounded-[14px] [&_[data-slot=card]]:border-[#dfe5f0] [&_[data-slot=card]]:bg-card [&_[data-slot=card]]:py-0 [&_[data-slot=card]]:shadow-[0_8px_24px_rgba(30,50,96,0.045)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SettingsNavigation({
  activePath,
  items,
  workspaceSlug,
}: {
  activePath: string
  items: Array<SettingsNavItem>
  workspaceSlug: string
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const targetPath = item.to.replace("$workspaceSlug", workspaceSlug)
        const isActive =
          activePath === targetPath ||
          activePath.startsWith(`${targetPath}/`) ||
          (activePath === `/w/${workspaceSlug}/settings` &&
            item.label === "General")
        const Icon = item.icon

        return (
          <Link
            key={item.to}
            to={item.to}
            params={{ workspaceSlug }}
            className={cn(
              "relative flex min-h-9 items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] font-medium text-[#7a86a4] transition-colors hover:bg-white hover:text-[#11245a]",
              isActive &&
                "bg-white font-semibold text-[#11245a] shadow-[0_4px_14px_rgba(30,50,96,0.04)] ring-1 ring-[#dfe5f0] before:absolute before:top-2 before:bottom-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function MobileSettingsIndex({
  className,
  items,
  workspaceSlug,
}: {
  className?: string
  items: Array<SettingsNavItem>
  workspaceSlug: string
}) {
  return (
    <section className={cn("md:hidden", className)}>
      <div className="mb-5">
        <h1 className="text-2xl leading-none font-extrabold tracking-[-0.045em]">
          Settings
        </h1>
        <p className="mt-1 text-sm font-medium text-[#61709a]">
          Configure your workspace and manage your team.
        </p>
      </div>

      <div className="flex flex-col gap-3 overflow-hidden rounded-2xl bg-[#f7f8fb] p-1 sm:bg-background">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.to}
              to={item.to}
              params={{ workspaceSlug }}
              className="flex h-18 min-h-17 items-center gap-3 rounded-2xl bg-background px-4 py-3.5 shadow-xs ring-[1.5px] ring-muted transition-all active:translate-y-px active:bg-muted/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <Icon className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{item.label}</span>
                <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                  {item.description}
                </span>
              </span>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/70" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function MobileSettingsDetailHeader({
  activePath,
  activeItem,
  workspaceSlug,
}: {
  activePath: string
  activeItem: SettingsNavItem | undefined
  workspaceSlug: string
}) {
  const title =
    activePath === `/w/${workspaceSlug}/settings` || !activeItem
      ? "Settings"
      : `${activeItem.label} settings`

  return (
    <section className="mb-5 md:hidden">
      <div className="flex items-center gap-3">
        <Link
          to="/w/$workspaceSlug/settings"
          params={{ workspaceSlug }}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#11245a] shadow-[0_4px_14px_rgba(30,50,96,0.08)] ring-1 ring-[#e7eaf2] transition-colors active:bg-[#eef3ff]"
        >
          <ChevronLeftIcon className="size-5" />
          <span className="sr-only">Back to settings</span>
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[2rem] leading-none font-extrabold tracking-[-0.055em] text-[#11245a]">
            {title}
          </h1>
          <p className="mt-2 text-sm font-semibold text-[#61709a]">
            {activeItem?.description ??
              "Manage your location and rota settings."}
          </p>
        </div>
      </div>
    </section>
  )
}

export { SettingsLayout, workspaceSettingsNavItems }
