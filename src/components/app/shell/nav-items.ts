import { Calendar, CalendarClockIcon, ClockIcon, HomeIcon } from "lucide-react"

import type { OrganizationCapabilities } from "@/lib/auth/get-org-capabilities"

type NavigationCapability = keyof Pick<
  OrganizationCapabilities,
  "canManageTimeClock" | "canViewRota"
>

type NavItem = {
  title: string
  routeKey: "dashboard" | "rota" | "timeClock" | "timesheets"
  icon: typeof HomeIcon
  requiredCapability?: NavigationCapability
}

const navItems = [
  {
    title: "Dashboard",
    routeKey: "dashboard" as const,
    icon: HomeIcon,
  },
  {
    title: "Rota",
    routeKey: "rota" as const,
    icon: Calendar,
    requiredCapability: "canViewRota",
  },
  {
    title: "Time clock",
    routeKey: "timeClock" as const,
    icon: ClockIcon,
    requiredCapability: "canManageTimeClock",
  },
  {
    title: "Timesheets",
    routeKey: "timesheets" as const,
    icon: CalendarClockIcon,
  },
] satisfies NavItem[]

export { navItems }
