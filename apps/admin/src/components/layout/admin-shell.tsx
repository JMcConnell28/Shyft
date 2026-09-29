import { Link, Outlet } from "@tanstack/react-router"
import { roleHasAdminPermission } from "@rocketrota/shared/admin"
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
import { SupportInboxIndicator } from "@/features/support/components/support-inbox-indicator"
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
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-950 md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="min-w-0 border-b border-slate-200 bg-white md:border-r md:border-b-0">
        <div className="hidden border-b border-slate-200 px-5 py-4 md:block">
          <p className="text-sm font-bold">RocketRota</p>
          <p className="text-xs font-medium text-slate-500">Admin console</p>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto px-3 py-2 md:block md:space-y-1 md:py-4"
          aria-label="Admin navigation"
        >
          {navItems
            .filter(
              (item) =>
                item.href !== "/support" ||
                roleHasAdminPermission(membership.role, "support.manage")
            )
            .map((item) => (
              <Link
                activeProps={{
                  className: "bg-slate-950 text-white",
                }}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <p className="text-sm font-semibold text-slate-600">
            {membership.name}
          </p>
          <div className="flex items-center gap-3">
            {roleHasAdminPermission(membership.role, "support.manage") ? (
              <SupportInboxIndicator />
            ) : null}
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {membership.role}
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export { AdminShell }
