"use client"

import { Link } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { MegaphoneIcon } from "lucide-react"

import type { DashboardAnnouncements } from "@/features/announcements/types"
import {
  DashboardEmptyState,
  DashboardPanel,
  DashboardPanelHeader,
} from "@/features/dashboard/components/dashboard-desktop-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function DashboardAnnouncementsPanel({
  announcements,
  href,
  variant = "desktop",
}: {
  announcements: DashboardAnnouncements
  href: string
  variant?: "desktop" | "mobile"
}) {
  if (variant === "mobile") {
    return (
      <section className="mt-3 animate-in rounded-[20px] bg-white p-4 shadow-[0_5px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7e9f0] duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
        <PanelHeader
          href={href}
          title="Announcements"
          unreadCount={announcements.unreadCount}
          variant="mobile"
        />
        <AnnouncementPreviewList
          announcements={announcements}
          href={href}
          variant="mobile"
        />
      </section>
    )
  }

  return (
    <DashboardPanel>
      <DashboardPanelHeader
        action={
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-[10px] border-[#dfe5f0] bg-white px-3 text-xs font-semibold text-[#33477d] shadow-none hover:bg-[#f7f8fb]"
            nativeButton={false}
            render={<Link to={href} />}
          >
            View all
          </Button>
        }
        icon={MegaphoneIcon}
        subtitle={
          announcements.unreadCount > 0
            ? `${announcements.unreadCount} unread`
            : "Latest workplace updates"
        }
        title="Announcements"
      />
      <div className="p-4">
        <AnnouncementPreviewList announcements={announcements} href={href} />
      </div>
    </DashboardPanel>
  )
}

function PanelHeader({
  href,
  title,
  unreadCount,
  variant = "desktop",
}: {
  href: string
  title: string
  unreadCount: number
  variant?: "desktop" | "mobile"
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4d6ee8]">
          <MegaphoneIcon className="size-5" />
        </span>
        <div>
          {variant === "desktop" ? (
            <h3 className="text-sm font-medium">{title}</h3>
          ) : (
            <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
              {title}
            </h2>
          )}
          {unreadCount > 0 ? (
            <p className="text-xs font-medium text-muted-foreground">
              {unreadCount} unread
            </p>
          ) : null}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        nativeButton={false}
        render={<Link to={href} />}
      >
        View all
      </Button>
    </div>
  )
}

function AnnouncementPreviewList({
  announcements,
  href,
  variant = "desktop",
}: {
  announcements: DashboardAnnouncements
  href: string
  variant?: "desktop" | "mobile"
}) {
  if (announcements.announcements.length === 0) {
    if (variant === "mobile") {
      return (
        <p className="rounded-lg border border-dashed border-border/70 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
          No announcements yet.
        </p>
      )
    }

    return <DashboardEmptyState title="No announcements yet" />
  }

  return (
    <div
      className={cn(
        "overflow-hidden",
        variant === "mobile"
          ? "divide-y divide-border/70 rounded-lg border border-border/70"
          : "divide-y divide-[#edf0f6] rounded-[12px] border border-[#dfe5f0] bg-white"
      )}
    >
      {announcements.announcements.map((announcement) => (
        <Link
          key={announcement.id}
          to={href}
          className={cn(
            "block transition-colors",
            variant === "mobile"
              ? "bg-background px-3 py-3 hover:bg-muted/20"
              : "bg-white px-3.5 py-3 hover:bg-[#fbfcff]"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate text-sm font-semibold",
                  variant === "desktop" && "text-[#11245a]"
                )}
              >
                {announcement.title}
              </p>
              <p
                className={cn(
                  "mt-1 line-clamp-2 text-xs leading-5",
                  variant === "mobile"
                    ? "text-muted-foreground"
                    : "font-medium text-[#7a86a4]"
                )}
              >
                {announcement.body}
              </p>
            </div>
            {announcement.isUnread ? <Badge>New</Badge> : null}
          </div>
          <p
            className={cn(
              "mt-2 text-xs",
              variant === "mobile"
                ? "text-muted-foreground"
                : "font-medium text-[#9aa4b8]"
            )}
          >
            {formatDistanceToNow(new Date(announcement.publishedAt), {
              addSuffix: true,
            })}
          </p>
        </Link>
      ))}
    </div>
  )
}

export { DashboardAnnouncementsPanel }
