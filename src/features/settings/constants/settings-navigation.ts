import {
  Building2Icon,
  CalendarRangeIcon,
  Clock3Icon,
  CreditCardIcon,
  MapPinnedIcon,
  Settings2Icon,
  UserRoundCheckIcon,
  UsersIcon,
} from "lucide-react"

import type { SettingsNavItem } from "@/features/settings/constants/settings-navigation.types"

const workspaceSettingsNavItems: Array<SettingsNavItem> = [
  {
    description: "Workplace details, locations, and contact information.",
    icon: Settings2Icon,
    label: "General",
    to: "/app/$workspaceSlug/settings/general",
  },
  {
    description: "Planning zones, templates, and rota defaults.",
    icon: CalendarRangeIcon,
    label: "Rota",
    to: "/app/$workspaceSlug/settings/rota",
  },
  {
    description: "Locations, opening hours, and closing estimates.",
    icon: MapPinnedIcon,
    label: "Locations",
    to: "/app/$workspaceSlug/settings/locations",
  },
  {
    description: "Manage team members and assign groups for each location.",
    icon: UsersIcon,
    label: "Team",
    to: "/app/$workspaceSlug/settings/team",
  },
  {
    description:
      "Control how your team clocks in and out, how stations behave, and how records are reviewed.",
    icon: Clock3Icon,
    label: "Clocking",
    to: "/app/$workspaceSlug/settings/clocking",
  },
  {
    description: "Subscription, payment method, usage, and invoices.",
    icon: CreditCardIcon,
    label: "Billing",
    to: "/app/$workspaceSlug/settings/billing",
  },
  {
    description: "Employees, roles, pay details, and location access.",
    icon: Building2Icon,
    label: "Company",
    requiresCompanyAdmin: true,
    to: "/app/$workspaceSlug/settings/company",
  },
  {
    description: "Approve or deny employee requests from staff invite links.",
    icon: UserRoundCheckIcon,
    label: "Join requests",
    requiresJoinApproval: true,
    to: "/app/$workspaceSlug/settings/company/join-requests",
  },
]

function getActiveSettingsItem({
  activePath,
  items,
  workspaceSlug,
}: {
  activePath: string
  items: Array<SettingsNavItem>
  workspaceSlug: string
}) {
  return (
    items
      .filter((item) => {
        const targetPath = item.to.replace("$workspaceSlug", workspaceSlug)
        return (
          activePath === targetPath || activePath.startsWith(`${targetPath}/`)
        )
      })
      .sort((a, b) => b.to.length - a.to.length)
      .at(0) ?? items[0]
  )
}

function getSettingsTitle(item: SettingsNavItem | undefined) {
  return item ? `${item.label} settings` : "Settings"
}

export { getActiveSettingsItem, getSettingsTitle, workspaceSettingsNavItems }
