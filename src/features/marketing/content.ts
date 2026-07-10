import {
  BellRingIcon,
  Building2Icon,
  CalendarClockIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FileTextIcon,
  MapPinIcon,
  PlaneTakeoffIcon,
  ShieldCheckIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react"

type MarketingFeatureSlug = "rota-planning" | "time-tracking" | "timesheets"

type MarketingFeaturePageContent = {
  slug: MarketingFeatureSlug
  title: string
  navTitle: string
  description: string
  eyebrow: string
  heroPoints: string[]
  workflowTitle: string
  workflowDescription: string
  workflowItems: Array<{
    title: string
    description: string
  }>
  proofTitle: string
  proofItems: string[]
  icon: typeof CalendarDaysIcon
}

const navigationFeatures = [
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
    href: null,
  },
  {
    title: "Manager dashboard",
    description: "See today's shifts, attendance and key actions fast.",
    icon: Building2Icon,
    href: null,
  },
  {
    title: "Staff updates",
    description: "Keep published rotas and important notes easy to find.",
    icon: BellRingIcon,
    href: null,
  },
] as const

const marketingFeaturePages = {
  "rota-planning": {
    slug: "rota-planning",
    navTitle: "Rota planning",
    eyebrow: "Rota planning",
    title: "Build clear rotas without the spreadsheet scramble",
    description:
      "Plan the week, assign staff and keep everyone aligned from one focused scheduling workspace.",
    icon: CalendarDaysIcon,
    heroPoints: [
      "Drag staff into shifts in seconds",
      "Filter by zone, role and team group",
      "Publish a clean staff view when the rota is ready",
    ],
    workflowTitle: "A calmer way to plan every week",
    workflowDescription:
      "RocketRota keeps the rota board readable while still giving managers the controls they need to move quickly.",
    workflowItems: [
      {
        title: "Plan by day and zone",
        description:
          "See the whole week at once, split shifts by working area and keep busy services easy to scan.",
      },
      {
        title: "Spot gaps before publishing",
        description:
          "Open shifts, coverage pressure and staff load are visible while you build the rota.",
      },
      {
        title: "Reuse reliable patterns",
        description:
          "Turn repeat weeks into templates so managers are not rebuilding the same rota from scratch.",
      },
    ],
    proofTitle: "Made for practical rota work",
    proofItems: [
      "Weekly schedules",
      "Shift templates",
      "Staff notes",
      "Published team views",
    ],
  },
  "time-tracking": {
    slug: "time-tracking",
    navTitle: "Time tracking",
    eyebrow: "Time tracking",
    title: "Know who is clocked in and what needs attention",
    description:
      "Give staff a simple clock-in flow while managers keep a live view of attendance across each location.",
    icon: TimerIcon,
    heroPoints: [
      "Staff clock in from assigned location flows",
      "Managers see live attendance status",
      "Late, missed and unusual entries are easier to catch",
    ],
    workflowTitle: "Attendance that connects back to the rota",
    workflowDescription:
      "Time tracking is built around scheduled shifts, so managers can compare planned work with what actually happened.",
    workflowItems: [
      {
        title: "Clock against scheduled shifts",
        description:
          "Match clock activity to the right shift or split-shift segment without extra admin.",
      },
      {
        title: "Review live exceptions",
        description:
          "See late clock-ins, forgotten clock-outs and entries that need manager review.",
      },
      {
        title: "Use location settings",
        description:
          "Set grace periods and clocking rules that fit how each workplace actually operates.",
      },
    ],
    proofTitle: "Built for shift-based teams",
    proofItems: [
      "Clock-in and clock-out",
      "Manager overrides",
      "Location rules",
      "Exception visibility",
    ],
  },
  timesheets: {
    slug: "timesheets",
    navTitle: "Timesheets",
    eyebrow: "Timesheets",
    title: "Turn clock data into clean, reviewable timesheets",
    description:
      "Review completed hours, fix exceptions and keep payroll preparation tidy without chasing scattered records.",
    icon: CalendarClockIcon,
    heroPoints: [
      "Review actual hours against shifts",
      "Edit entries that need manager attention",
      "Separate employee and manager views",
    ],
    workflowTitle: "A simple review layer before payroll",
    workflowDescription:
      "Timesheets bring together scheduled shifts and clock activity so managers can approve the week with confidence.",
    workflowItems: [
      {
        title: "See the week clearly",
        description:
          "Group entries by employee and date so missing or unusual records stand out quickly.",
      },
      {
        title: "Fix what needs fixing",
        description:
          "Adjust clock times with a clear manager workflow instead of patching records elsewhere.",
      },
      {
        title: "Keep staff informed",
        description:
          "Employee-friendly views help staff understand their own recorded time.",
      },
    ],
    proofTitle: "Ready for weekly review",
    proofItems: [
      "Actual hours",
      "Scheduled context",
      "Manager edits",
      "Review states",
    ],
  },
} satisfies Record<MarketingFeatureSlug, MarketingFeaturePageContent>

const featurePageTrustItems = [
  {
    title: "Clear for managers",
    description: "Every workflow is designed for quick decisions during a busy week.",
    icon: CheckCircle2Icon,
  },
  {
    title: "Location aware",
    description: "Keep rota, clocking and review work tied to the right workplace.",
    icon: MapPinIcon,
  },
  {
    title: "Controlled by default",
    description: "Important actions stay intentional, traceable and easy to understand.",
    icon: ShieldCheckIcon,
  },
] as const

const featureHighlights = [
  {
    title: "Smart scheduling",
    description: "Create rotas in minutes with drag-and-drop simplicity.",
    icon: CalendarDaysIcon,
  },
  {
    title: "Fair and flexible",
    description: "Balance workloads and availability with ease.",
    icon: UsersIcon,
  },
  {
    title: "Shift templates",
    description: "Build once, reuse forever. Save time on repeat weeks.",
    icon: FileTextIcon,
  },
  {
    title: "Team availability",
    description: "See who's available and avoid scheduling conflicts.",
    icon: Clock3Icon,
  },
  {
    title: "Leave management",
    description: "Handle time off requests in one central place.",
    icon: PlaneTakeoffIcon,
  },
  {
    title: "Real-time updates",
    description: "Instant notifications keep everyone in the loop.",
    icon: BellRingIcon,
  },
] as const

const adminBenefits = [
  "Publish rotas with one click",
  "Reduce no-shows and last-minute changes",
  "Stay compliant with clear audit trails",
  "Access anywhere, on any device",
] as const

const customerLogos = [
  "cloudbase",
  "apexive",
  "Summit",
  "PULSE",
  "velocity",
  "NORTHWAY",
] as const

export {
  adminBenefits,
  customerLogos,
  featureHighlights,
  featurePageTrustItems,
  marketingFeaturePages,
  navigationFeatures,
}

export type { MarketingFeatureSlug }
