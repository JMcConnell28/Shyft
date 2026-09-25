"use client"

import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react"

import type { SettingsNavItem } from "@/features/settings/constants/settings-navigation.types"
import { getSettingsTitle } from "@/features/settings/constants/settings-navigation"
import { cn } from "@/lib/utils"

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
    <nav className="space-y-1.5">
      {items.map((item) => {
        const targetPath = item.to.replace("$workspaceSlug", workspaceSlug)
        const isActive =
          activePath === targetPath ||
          activePath.startsWith(`${targetPath}/`) ||
          (activePath === `/app/${workspaceSlug}/settings` &&
            item.label === "General")
        const Icon = item.icon

        return (
          <Link
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors",
              isActive
                ? "bg-blue-50 text-blue-600 hover:bg-blue-50"
                : "text-[#53617f] hover:bg-[#f5f7fb] hover:text-[#10204b]"
            )}
            key={item.to}
            params={{ workspaceSlug }}
            to={item.to}
          >
            <Icon className="size-[18px] shrink-0" />
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
      <header className="mb-4">
        <h1 className="text-2xl leading-none font-bold tracking-[-0.04em] text-[#10204b]">
          Settings
        </h1>
        <p className="mt-2 text-sm font-medium text-[#657398]">
          Configure your workspace, rota, team, and clocking.
        </p>
      </header>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <Link
              className="flex min-h-24 items-center gap-4 rounded-xl border border-[#dfe4ef] bg-white px-4 py-3.5 transition-colors active:bg-[#f6f8fc]"
              key={item.to}
              params={{ workspaceSlug }}
              to={item.to}
            >
              <Icon className="size-5 shrink-0 text-[#1769ff]" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#10204b]">
                  {item.label}
                </span>
                <span className="mt-1 block text-xs leading-5 font-medium text-[#7180a2]">
                  {item.description}
                </span>
              </span>
              <ChevronRightIcon className="size-4 shrink-0 text-[#46577d]" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function MobileSettingsDetailHeader({
  activeItem,
  workspaceSlug,
}: {
  activeItem: SettingsNavItem | undefined
  workspaceSlug: string
}) {
  return (
    <header className="mb-4 md:hidden">
      <div className="flex items-center gap-2.5">
        <Link
          aria-label="Back to settings"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#dfe4ef] bg-white text-blue-600 shadow-sm active:bg-blue-50"
          params={{ workspaceSlug }}
          to="/app/$workspaceSlug/settings"
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <h1 className="text-2xl leading-none font-bold tracking-[-0.04em] text-[#10204b]">
          {getSettingsTitle(activeItem)}
        </h1>
      </div>
      <p className="mt-2 text-sm leading-5 font-medium text-[#657398]">
        {activeItem?.description ?? "Manage your workspace configuration."}
      </p>
    </header>
  )
}

export { MobileSettingsDetailHeader, MobileSettingsIndex, SettingsNavigation }
