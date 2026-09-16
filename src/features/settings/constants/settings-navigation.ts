import {
  Building2Icon,
  CalendarRangeIcon,
  Clock3Icon,
  CreditCardIcon,
  MapPinnedIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react"

import type { SettingsNavItem } from "@/features/settings/constants/settings-navigation.types"

const workspaceSettingsNavItems: Array<SettingsNavItem> = [
  {
    description: "Workplace details, locations, and contact information.",
    icon: Settings2Icon,
    label: "General",
    to: "/w/$workspaceSlug/settings/general",
  },
  {
    description: "Planning zones, templates, and rota defaults.",
    icon: CalendarRangeIcon,
    label: "Rota",
    to: "/w/$workspaceSlug/settings/rota",
  },
  {
    description: "Locations, opening hours, and closing estimates.",
    icon: MapPinnedIcon,
    label: "Locations",
    organizationOnly: true,
    to: "/w/$workspaceSlug/settings/locations",
  },
  {
    description: "Manage team members and assign groups for each location.",
    icon: UsersIcon,
    label: "Team",
    to: "/w/$workspaceSlug/settings/team",
  },
  {
    description:
      "Control how your team clocks in and out, how stations behave, and how records are reviewed.",
    icon: Clock3Icon,
    label: "Clocking",
    to: "/w/$workspaceSlug/settings/clocking",
  },
  {
    description: "Subscription, payment method, usage, and invoices.",
    icon: CreditCardIcon,
    label: "Billing",
    to: "/w/$workspaceSlug/settings/billing",
  },
  {
    description: "Employees, roles, pay details, and location access.",
    icon: Building2Icon,
    label: "Company",
    to: "/w/$workspaceSlug/settings/company",
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
    items.find((item) => {
      const targetPath = item.to.replace("$workspaceSlug", workspaceSlug)
      return (
        activePath === targetPath || activePath.startsWith(`${targetPath}/`)
      )
    }) ?? items[0]
  )
}

function getSettingsTitle(item: SettingsNavItem | undefined) {
  return item ? `${item.label} settings` : "Settings"
}

export { getActiveSettingsItem, getSettingsTitle, workspaceSettingsNavItems }
