"use client"

import type { ReactNode } from "react"

import {
  MobileSettingsDetailHeader,
  MobileSettingsIndex,
  SettingsNavigation,
} from "@/features/settings/components/settings-navigation"
import {
  getActiveSettingsItem,
  getSettingsTitle,
  workspaceSettingsNavItems,
} from "@/features/settings/constants/settings-navigation"
import { cn } from "@/lib/utils"

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
  children: ReactNode
}) {
  const navItems = workspaceSettingsNavItems.filter(
    (item) => !item.organizationOnly || workspaceType === "organization"
  )
  const settingsRootPath = `/w/${workspaceSlug}/settings`
  const isCategoryIndex = activePath === settingsRootPath
  const activeItem = getActiveSettingsItem({
    activePath,
    items: navItems,
    workspaceSlug,
  })

  return (
    <div className="flex w-full flex-1 flex-col bg-[#f6f8fc] px-4 py-5 text-[#10204b] sm:px-5 sm:py-6 md:min-h-full md:p-0">
      <div className="settings-layout-grid flex-1 md:min-h-full">
        <aside className="hidden border-r border-[#e3e8f2] bg-white px-4 py-6 md:block">
          <div className="md:sticky md:top-6">
            <h2 className="mb-4 px-2.5 text-base font-bold tracking-[-0.025em] text-[#10204b]">
              Settings
            </h2>
            <SettingsNavigation
              activePath={activePath}
              items={navItems}
              workspaceSlug={workspaceSlug}
            />
          </div>
        </aside>

        <main className="min-w-0 md:px-6 md:py-5 lg:px-7 lg:py-6">
          <MobileSettingsIndex
            className={cn(!isCategoryIndex && "hidden")}
            items={navItems}
            workspaceSlug={workspaceSlug}
          />

          <div className={cn(isCategoryIndex ? "hidden md:block" : "block")}>
            {!contentOnly ? (
              <>
                <MobileSettingsDetailHeader
                  activeItem={activeItem}
                  workspaceSlug={workspaceSlug}
                />
                <header className="mb-4 hidden md:block">
                  <h1 className="text-2xl font-bold tracking-[-0.035em]">
                    {getSettingsTitle(activeItem)}
                  </h1>
                  <p className="mt-1 max-w-3xl text-xs font-medium text-[#657398]">
                    {activeItem.description}
                  </p>
                </header>
              </>
            ) : null}
            <div className="settings-content min-w-0 [&_[data-slot=card-content]]:px-4 [&_[data-slot=card-content]]:py-4 [&_[data-slot=card-header]]:min-h-14 [&_[data-slot=card-header]]:rounded-none [&_[data-slot=card-header]]:border-b [&_[data-slot=card-header]]:border-[#edf0f6] [&_[data-slot=card-header]]:px-4 [&_[data-slot=card-header]]:py-3 [&_[data-slot=card]]:gap-0 [&_[data-slot=card]]:overflow-hidden [&_[data-slot=card]]:rounded-xl [&_[data-slot=card]]:border-[#dfe4ef] [&_[data-slot=card]]:bg-white [&_[data-slot=card]]:py-0 [&_[data-slot=card]]:shadow-[0_5px_18px_rgba(30,50,96,0.035)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export { SettingsLayout, workspaceSettingsNavItems }
