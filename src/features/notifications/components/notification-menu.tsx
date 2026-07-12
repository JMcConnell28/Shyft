"use client"

import { Link } from "@tanstack/react-router"
import { BellIcon, CalendarDaysIcon, MegaphoneIcon } from "lucide-react"

import type { DashboardAnnouncement } from "@/features/announcements/types"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function NotificationMenu({
  announcements,
  hasUnreadRotaUpdates,
  prominent,
  workspaceSlug,
}: {
  announcements: Array<DashboardAnnouncement>
  hasUnreadRotaUpdates: boolean
  prominent: boolean
  workspaceSlug: string
}) {
  const unreadCount =
    announcements.filter((announcement) => announcement.isUnread).length +
    Number(hasUnreadRotaUpdates)

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="pill"
            size="icon"
            className={cn(
              "relative ml-auto",
              prominent &&
                "size-11 rounded-xl bg-white text-[#142453] shadow-[0_4px_14px_rgba(30,50,96,0.08)] ring-1 ring-[#e7eaf2] hover:bg-white md:size-8 md:rounded-full"
            )}
          />
        }
      >
        <BellIcon className="size-4.5" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex min-w-4.5 items-center justify-center rounded-full bg-[#f04444] px-1 text-[10px] leading-4.5 font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
        <span className="sr-only">Open notifications</span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-2xl border border-[#dfe5f0] bg-white p-0 shadow-[0_18px_50px_rgba(20,36,83,0.18)] ring-0"
      >
        <div className="border-b border-[#e9edf5] px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-extrabold text-[#11245a]">
              Notifications
            </h2>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-[#eef3ff] px-2 py-1 text-[10px] font-bold text-[#0968f5]">
                {unreadCount} new
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs font-medium text-[#61709a]">
            Recent updates from your workspace
          </p>
        </div>

        <div className="max-h-[22rem] divide-y divide-[#edf0f6] overflow-y-auto">
          {hasUnreadRotaUpdates ? (
            <NotificationLink
              href={`/w/${workspaceSlug}/rota`}
              icon={CalendarDaysIcon}
              title="Your rota has been updated"
              description="Open the rota list to view the latest published shifts."
              unread
            />
          ) : null}
          {announcements.map((announcement) => (
            <NotificationLink
              key={announcement.id}
              href={`/w/${workspaceSlug}/announcements`}
              icon={MegaphoneIcon}
              title={announcement.title}
              description={`${announcement.authorName} · ${formatTimeAgo(announcement.publishedAt)}`}
              unread={announcement.isUnread}
            />
          ))}
          {!hasUnreadRotaUpdates && announcements.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <BellIcon className="mx-auto size-5 text-[#96a1ba]" />
              <p className="mt-2 text-sm font-semibold text-[#405078]">
                You’re all caught up
              </p>
              <p className="mt-1 text-xs text-[#7a86a4]">
                New rota updates and announcements will appear here.
              </p>
            </div>
          ) : null}
        </div>

        <Link
          to="/w/$workspaceSlug/announcements"
          params={{ workspaceSlug }}
          className="block border-t border-[#e9edf5] px-4 py-3 text-center text-xs font-bold text-[#0968f5] hover:bg-[#f7f9fd]"
        >
          View all announcements
        </Link>
      </PopoverContent>
    </Popover>
  )
}

function NotificationLink({
  description,
  href,
  icon: Icon,
  title,
  unread,
}: {
  description: string
  href: string
  icon: typeof BellIcon
  title: string
  unread: boolean
}) {
  return (
    <Link
      to={href}
      className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-[#f7f9fd]"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0968f5]">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-[#11245a]">
          {title}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed font-medium text-[#61709a]">
          {description}
        </span>
      </span>
      {unread ? (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#0968f5]" />
      ) : null}
    </Link>
  )
}

function formatTimeAgo(value: string) {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60_000)
  )
  if (elapsedMinutes < 1) return "Just now"
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`
  const hours = Math.floor(elapsedMinutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? "Yesterday" : `${days}d ago`
}

export { NotificationMenu }
