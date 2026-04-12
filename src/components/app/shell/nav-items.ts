import { Calendar, HomeIcon } from "lucide-react"

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
  },
]

export { navItems }
