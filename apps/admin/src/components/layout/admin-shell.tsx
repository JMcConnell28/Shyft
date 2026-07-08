import { Link, Outlet } from "@tanstack/react-router"
import {
  ActivityIcon,
  AlertTriangleIcon,
  Building2Icon,
  Clock3Icon,
  FlagIcon,
  GaugeIcon,
  LifeBuoyIcon,
  ReceiptTextIcon,
  UsersIcon,
} from "lucide-react"

import type { AdminMembership } from "@/features/auth/server/admin-session"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: GaugeIcon, label: "Dashboard" },
  { href: "/workspaces", icon: Building2Icon, label: "Workspaces" },
  { href: "/clock-stations", icon: Clock3Icon, label: "Clock stations" },
  { href: "/users", icon: UsersIcon, label: "Users" },
  { href: "/billing", icon: ReceiptTextIcon, label: "Billing" },
  { href: "/feature-flags", icon: FlagIcon, label: "Feature flags" },
  { href: "/errors", icon: AlertTriangleIcon, label: "Errors" },
  { href: "/events", icon: ActivityIcon, label: "Events" },
  { href: "/support", icon: LifeBuoyIcon, label: "Support" },
] as const

function AdminShell({ membership }: { membership: AdminMembership }) {
  return (
    <div className="grid min-h-dvh grid-cols-[16rem_1fr] bg-slate-50 text-slate-950">
      <aside className="border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-bold">RocketRota</p>
          <p className="text-xs font-medium text-slate-500">Admin console</p>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              activeProps={{
                className: "bg-slate-950 text-white",
              }}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
              key={item.href}
              to={item.href}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
          <p className="text-sm font-semibold text-slate-600">
            {membership.name}
          </p>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {membership.role}
          </span>
        </header>
        <main className="mx-auto w-full max-w-7xl px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export { AdminShell }
