"use client"

import { Link, Outlet, useLocation } from "@tanstack/react-router"
import { roleHasAdminPermission } from "@rocketrota/shared/admin"
import {
  ActivityIcon,
  AlertTriangleIcon,
  Building2Icon,
  Clock3Icon,
  FlagIcon,
  GaugeIcon,
  LifeBuoyIcon,
  MenuIcon,
  ReceiptTextIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useRef } from "react"

import type { AdminMembership } from "@/features/auth/server/admin-session"
import { SupportInboxIndicator } from "@/features/support/components/support-inbox-indicator"

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

function AdminNavigation({
  membership,
  onNavigate,
}: {
  membership: AdminMembership
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-1 px-3 py-4" aria-label="Admin navigation">
      {navItems
        .filter(
          (item) =>
            item.href !== "/support" ||
            roleHasAdminPermission(membership.role, "support.manage")
        )
        .map((item) => (
          <Link
            activeProps={{ className: "bg-slate-950 text-white" }}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            key={item.href}
            onClick={onNavigate}
            to={item.href}
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
    </nav>
  )
}

function AdminBrand() {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <img src="/pwa/icon-192.png" alt="" className="size-9 rounded-lg" />
      <div>
        <p className="text-sm font-bold">Admin</p>
        <p className="text-xs font-medium text-slate-500">RocketRota</p>
      </div>
    </div>
  )
}

function AdminShell({ membership }: { membership: AdminMembership }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pathname = useLocation({ select: (location) => location.pathname })

  useEffect(() => {
    if (dialogRef.current?.open) dialogRef.current.close()
  }, [pathname])

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const closeOnDesktop = () => {
      if (desktop.matches && dialogRef.current?.open) dialogRef.current.close()
    }

    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])

  return (
    <div className="min-h-dvh min-w-0 bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200">
          <AdminBrand />
        </div>
        <AdminNavigation membership={membership} />
      </aside>
      <dialog
        ref={dialogRef}
        aria-label="Admin navigation"
        className="m-0 h-dvh max-h-dvh w-72 max-w-[calc(100vw-3rem)] overflow-y-auto border-0 bg-white p-0 shadow-xl backdrop:bg-slate-950/50 lg:hidden"
        onClick={(event) => {
          if (event.target === dialogRef.current && dialogRef.current.open) {
            dialogRef.current.close()
          }
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-200">
          <AdminBrand />
          <button
            type="button"
            aria-label="Close navigation"
            className="mr-3 rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            onClick={() => dialogRef.current?.close()}
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <AdminNavigation
          membership={membership}
          onNavigate={() => dialogRef.current?.close()}
        />
      </dialog>
      <div className="min-w-0">
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 sm:px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="Open navigation"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 lg:hidden"
              onClick={() => dialogRef.current?.showModal()}
            >
              <MenuIcon className="size-5" />
            </button>
            <p className="truncate text-sm font-semibold text-slate-600">
              {membership.name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {roleHasAdminPermission(membership.role, "support.manage") ? (
              <SupportInboxIndicator />
            ) : null}
            <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
              {membership.role}
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl min-w-0 px-3 py-5 sm:px-4 lg:px-6 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export { AdminShell }
