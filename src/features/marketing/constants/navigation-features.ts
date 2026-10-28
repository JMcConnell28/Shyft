import {
  BellRingIcon,
  Building2Icon,
  CalendarClockIcon,
  CalendarDaysIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react"

export const navigationFeatures = [
  {
    title: "Rota planning",
    description: "Build weekly schedules with drag-and-drop shifts.",
    icon: CalendarDaysIcon,
    href: "/features/rota-planning",
  },
  {
    title: "Time tracking",
    description: "Clock-in flows for staff and live manager visibility.",
    icon: TimerIcon,
    href: "/features/time-tracking",
  },
  {
    title: "Timesheets",
    description: "Review hours, exceptions and adjustments in one place.",
    icon: CalendarClockIcon,
    href: "/features/timesheets",
  },
  {
    title: "Team management",
    description: "Organise staff, groups, roles and locations clearly.",
    icon: UsersIcon,
    href: "/features/team-management",
  },
  {
    title: "Manager dashboard",
    description: "See today's shifts, attendance and key actions fast.",
    icon: Building2Icon,
    href: "/features/manager-dashboard",
  },
  {
    title: "Staff updates",
    description: "Keep published rotas and important notes easy to find.",
    icon: BellRingIcon,
    href: "/features/staff-updates",
  },
] as const
