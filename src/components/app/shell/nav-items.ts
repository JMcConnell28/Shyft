import {
  Calendar,
  CalendarClockIcon,
  ClockIcon,
  HomeIcon,
  LifeBuoyIcon,
  MegaphoneIcon,
  ShuffleIcon,
  UsersRoundIcon,
} from "lucide-react"

import type { OrganizationCapabilities } from "@/lib/auth/get-org-capabilities"

type NavigationCapability = keyof Pick<
  OrganizationCapabilities,
  "canManageTimeClock" | "canViewRota" | "canUseSupport"
>

type NavItem = {
  title: string
  routeKey:
    | "announcements"
    | "dashboard"
    | "manage"
    | "rota"
    | "shiftSwaps"
    | "support"
    | "timeClock"
    | "timesheets"
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
    title: "Manage",
    routeKey: "manage" as const,
    icon: UsersRoundIcon,
  },
  {
    title: "Rotas",
    routeKey: "rota" as const,
    icon: Calendar,
    requiredCapability: "canViewRota",
  },
  {
    title: "Announcements",
    routeKey: "announcements" as const,
    icon: MegaphoneIcon,
  },
  {
    title: "Timesheets",
    routeKey: "timesheets" as const,
    icon: CalendarClockIcon,
  },
  {
    title: "Shift swaps",
    routeKey: "shiftSwaps" as const,
    icon: ShuffleIcon,
    requiredCapability: "canViewRota",
  },
  {
    title: "Time tracking",
    routeKey: "timeClock" as const,
    icon: ClockIcon,
    requiredCapability: "canManageTimeClock",
  },
  {
    title: "Support",
    routeKey: "support" as const,
    icon: LifeBuoyIcon,
    requiredCapability: "canUseSupport",
  },
] satisfies Array<NavItem>

export { navItems }
