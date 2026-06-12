"use client"

import { Link } from "@tanstack/react-router"
import {
  CalendarRangeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CreditCardIcon,
  GitMergeIcon,
  MapPinnedIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react"

import { DevEmailTestingPanel } from "@/features/email/components/dev-email-testing-panel"
import { cn } from "@/lib/utils"

type SettingsRoute =
  | "/w/$workspaceSlug/settings/general"
  | "/w/$workspaceSlug/settings/locations"
  | "/w/$workspaceSlug/settings/connections"
  | "/w/$workspaceSlug/settings/clocking"
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

const workspaceSettingsNavItems: SettingsNavItem[] = [
  {
    to: "/w/$workspaceSlug/settings/general",
    label: "General",
    description: "Workspace details and operating defaults.",
    icon: Settings2Icon,
  },
  {
    to: "/w/$workspaceSlug/settings/locations",
    label: "Locations",
    description: "Opening hours and closing estimates.",
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
    to: "/w/$workspaceSlug/settings/team",
    label: "Team",
    description: "Staff groups and employee assignments.",
    icon: UsersIcon,
  },
  {
    to: "/w/$workspaceSlug/settings/clocking",
    label: "Clocking",
    description: "Clock-in methods and location checks.",
    icon: ClockIcon,
  },
  {
    to: "/w/$workspaceSlug/settings/connections",
    label: "Connections",
    description: "Workspace structure and integrations.",
    icon: GitMergeIcon,
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
  children,
}: {
  workspaceSlug: string
  workspaceType?: "location" | "organization"
  activePath: string
  children: React.ReactNode
}) {
  const navItems = workspaceSettingsNavItems.filter(
    (item) => !item.organizationOnly || workspaceType === "organization"
  )
  const settingsRootPath = `/w/${workspaceSlug}/settings`
  const isCategoryIndex = activePath === settingsRootPath
  const activeItem =
    navItems.find(
      (item) => item.to.replace("$workspaceSlug", workspaceSlug) === activePath
    ) ?? navItems[0]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
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

        <main className="min-w-0 md:border-l md:border-border/70 md:pl-8 lg:pl-10">
          <MobileSettingsIndex
            className={cn(!isCategoryIndex && "hidden")}
            items={navItems}
            workspaceSlug={workspaceSlug}
          />

          <div className={cn(isCategoryIndex ? "hidden md:block" : "block")}>
            <MobileDetailHeader workspaceSlug={workspaceSlug} />
            <header className="mb-7 border-b border-border/70 pb-5">
              <h1 className="text-2xl font-semibold tracking-tight">
                {activeItem.label}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                {activeItem.description}
              </p>
            </header>
            <div className="settings-content min-w-0 [&_[data-slot=card-content]]:px-0 [&_[data-slot=card-content]]:py-4 [&_[data-slot=card-header]]:rounded-none [&_[data-slot=card-header]]:border-b [&_[data-slot=card-header]]:border-border/60 [&_[data-slot=card-header]]:px-0 [&_[data-slot=card-header]]:pt-1 [&_[data-slot=card-header]]:pb-4 [&_[data-slot=card]]:gap-0 [&_[data-slot=card]]:overflow-visible [&_[data-slot=card]]:rounded-none [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:py-0 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:ring-0">
              {children}
            </div>

            {import.meta.env.DEV ? (
              <div className="mt-10 border-t border-border/60 pt-6">
                <DevEmailTestingPanel
                  workspaceSlug={workspaceSlug}
                  workspaceType={workspaceType}
                />
              </div>
            ) : null}
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
  items: SettingsNavItem[]
  workspaceSlug: string
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const targetPath = item.to.replace("$workspaceSlug", workspaceSlug)
        const isActive =
          activePath === targetPath ||
          (activePath === `/w/${workspaceSlug}/settings` &&
            item.label === "General")
        const Icon = item.icon

        return (
          <Link
            key={item.to}
            to={item.to}
            params={{ workspaceSlug }}
            className={cn(
              "relative flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
              isActive &&
                "bg-primary/8 font-medium text-primary before:absolute before:top-2 before:bottom-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
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
  items: SettingsNavItem[]
  workspaceSlug: string
}) {
  return (
    <section className={cn("md:hidden", className)}>
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose what you want to manage.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.to}
              to={item.to}
              params={{ workspaceSlug }}
              className="flex min-h-17 items-center gap-3 border-b border-border/60 px-4 py-3.5 last:border-b-0 active:bg-muted/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <Icon className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
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

function MobileDetailHeader({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <div className="mb-5 md:hidden">
      <Link
        to="/w/$workspaceSlug/settings"
        params={{ workspaceSlug }}
        className="-ml-1 inline-flex min-h-9 items-center gap-1 text-sm font-medium text-primary"
      >
        <ChevronLeftIcon className="size-4" />
        Settings
      </Link>
    </div>
  )
}

export { SettingsLayout, workspaceSettingsNavItems }
