import type { LucideIcon } from "lucide-react"
import {
  CalendarDaysIcon,
  CheckIcon,
  Clock3Icon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react"

import type { OrganizationCapabilities } from "@/lib/auth/get-org-capabilities"

type WelcomeCapabilities = Pick<
  OrganizationCapabilities,
  "canManageRota" | "canManageSettings" | "canManageTeamMembers"
>

type WelcomeStep = {
  title: string
  description: string
  items: Array<{
    icon: LucideIcon
    title: string
    description: string
  }>
}

function getDashboardWelcomeSteps(
  capabilities: WelcomeCapabilities
): WelcomeStep[] {
  const isManager =
    capabilities.canManageRota ||
    capabilities.canManageSettings ||
    capabilities.canManageTeamMembers

  if (!isManager) return employeeSteps

  const managerItems: WelcomeStep["items"] = []

  if (capabilities.canManageRota) {
    managerItems.push({
      icon: CalendarDaysIcon,
      title: "Build and publish rotas",
      description:
        "Plan privately, then publish when the schedule is ready for staff.",
    })
  }

  if (capabilities.canManageTeamMembers) {
    managerItems.push({
      icon: UsersIcon,
      title: "Organise your team",
      description: "Invite staff, assign groups, and control who is active.",
    })
  }

  if (capabilities.canManageSettings) {
    managerItems.push({
      icon: Settings2Icon,
      title: "Set up the workspace",
      description:
        "Configure rota rules, opening times, locations, and preferences.",
    })
  }

  return [
    {
      title: "A clear starting point",
      description:
        "Use the dashboard to spot what needs attention before planning the week.",
      items: [
        {
          icon: CalendarDaysIcon,
          title: "Upcoming shifts",
          description:
            "Published work and the current week stay visible at a glance.",
        },
        {
          icon: Clock3Icon,
          title: "Live clock status",
          description:
            "See current attendance information without opening another report.",
        },
      ],
    },
    {
      title: "Your main tools",
      description:
        "The sidebar keeps each part of workforce planning within reach.",
      items: managerItems,
    },
    {
      title: "You are ready to begin",
      description:
        "Start with the rota, or finish configuring the workspace first.",
      items: [
        {
          icon: CheckIcon,
          title: "Nothing here is permanent",
          description:
            "Adjust team access and workspace settings as your operation grows.",
        },
      ],
    },
  ]
}

const employeeSteps: WelcomeStep[] = [
  {
    title: "Your working week at a glance",
    description: "The dashboard keeps the most useful information close by.",
    items: [
      {
        icon: CalendarDaysIcon,
        title: "See published shifts",
        description: "Draft rotas stay private until a manager publishes them.",
      },
      {
        icon: Clock3Icon,
        title: "Track today's work",
        description:
          "See your clock status and completed time from the dashboard.",
      },
    ],
  },
  {
    title: "You are ready",
    description: "RocketRota will keep your schedule and updates in one place.",
    items: [
      {
        icon: CheckIcon,
        title: "Start with your next shift",
        description: "Return to this dashboard whenever you need an overview.",
      },
    ],
  },
]

export { getDashboardWelcomeSteps }
export type { WelcomeCapabilities, WelcomeStep }
