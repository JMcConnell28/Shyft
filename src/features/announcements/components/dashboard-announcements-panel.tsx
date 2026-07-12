"use client"

import { Link } from "@tanstack/react-router"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"
import { ChevronRightIcon, MegaphoneIcon } from "lucide-react"

import type {
  DashboardAnnouncement,
  DashboardAnnouncements,
} from "@/features/announcements/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DashboardEmptyState,
  DashboardPanel,
  DashboardPanelHeader,
} from "@/features/dashboard/components/dashboard-desktop-panel"

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
      <MobileAnnouncementsPanel announcements={announcements} href={href} />
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

function MobileAnnouncementsPanel({
  announcements,
  href,
}: {
  announcements: DashboardAnnouncements
  href: string
}) {
  const announcement = announcements.announcements.at(0)

  return (
    <section className="mt-5 animate-in duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <h2 className="text-lg leading-tight font-extrabold tracking-[-0.025em] text-[#0b1836]">
        Announcements
      </h2>
      {announcement ? (
        <Link
          to={href}
          className="mt-2.5 block overflow-hidden rounded-xl border border-[#ffd2d2] bg-[#fffafa] transition-colors active:bg-[#fff4f4]"
        >
          <div className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-2.5 px-3 py-3">
            <span className="flex size-[2.625rem] items-center justify-center rounded-full bg-[#ffe8e8] text-[#e31818]">
              <MegaphoneIcon className="size-[1.375rem]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0 pr-4">
              <span className="inline-flex rounded-sm bg-[#ffe2e2] px-1.5 py-0.5 text-xs font-extrabold text-[#df1717]">
                {announcement.isUnread ? "New" : "Update"}
              </span>
              <p className="mt-1.5 text-[0.9375rem] leading-tight font-extrabold tracking-[-0.02em] text-[#102044]">
                {announcement.title}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-5 font-medium text-[#4e5e7d]">
                {announcement.body}
              </p>
              <p className="mt-2 text-[0.8125rem] font-medium text-[#4e5e7d]">
                Posted by {announcement.authorName} ·{" "}
                {formatAnnouncementDate(announcement)}
              </p>
            </div>
            {announcement.isUnread ? (
              <span className="absolute top-3.5 right-3.5 size-2.5 rounded-full bg-[#0865f5]" />
            ) : null}
          </div>
          <div className="flex items-center justify-center gap-1.5 border-t border-[#ffd2d2] px-4 py-3 text-sm font-extrabold tracking-[-0.015em] text-[#0865f5]">
            View all announcements
            <ChevronRightIcon className="size-4" strokeWidth={2.5} />
          </div>
        </Link>
      ) : (
        <Link
          to={href}
          className="mt-2.5 flex min-h-28 items-center justify-center rounded-xl border border-dashed border-[#d9dfeb] bg-white px-4 text-sm font-medium text-[#66738d]"
        >
          No announcements yet.
        </Link>
      )}
    </section>
  )
}

function AnnouncementPreviewList({
  announcements,
  href,
}: {
  announcements: DashboardAnnouncements
  href: string
}) {
  if (announcements.announcements.length === 0) {
    return <DashboardEmptyState title="No announcements yet" />
  }

  return (
    <div className="divide-y divide-[#edf0f6] overflow-hidden rounded-[12px] border border-[#dfe5f0] bg-white">
      {announcements.announcements.map((announcement) => (
        <DesktopAnnouncementRow
          announcement={announcement}
          href={href}
          key={announcement.id}
        />
      ))}
    </div>
  )
}

function DesktopAnnouncementRow({
  announcement,
  href,
}: {
  announcement: DashboardAnnouncement
  href: string
}) {
  return (
    <Link
      to={href}
      className="block bg-white px-3.5 py-3 transition-colors hover:bg-[#fbfcff]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#11245a]">
            {announcement.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 font-medium text-[#7a86a4]">
            {announcement.body}
          </p>
        </div>
        {announcement.isUnread ? <Badge>New</Badge> : null}
      </div>
      <p className="mt-2 text-xs font-medium text-[#9aa4b8]">
        {formatDistanceToNow(new Date(announcement.publishedAt), {
          addSuffix: true,
        })}
      </p>
    </Link>
  )
}

function formatAnnouncementDate(announcement: DashboardAnnouncement) {
  const publishedAt = new Date(announcement.publishedAt)

  if (isToday(publishedAt)) {
    return "Today"
  }

  if (isYesterday(publishedAt)) {
    return "Yesterday"
  }

  return format(publishedAt, "d MMM")
}

export { DashboardAnnouncementsPanel }
