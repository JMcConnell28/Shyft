"use client"

import { formatDistanceToNow } from "date-fns"
import { PinIcon } from "lucide-react"

import type { AnnouncementSummary } from "@/features/announcements/types"
import { Button } from "@/components/ui/button"
import { AnnouncementPoll } from "@/features/announcements/components/announcement-poll"
import { cn } from "@/lib/utils"

type AnnouncementCardProps = {
  announcement: AnnouncementSummary
  isArchiving?: boolean
  isMarkingRead?: boolean
  isVoting?: boolean
  onArchive?: (announcement: AnnouncementSummary) => void
  onEdit?: (announcement: AnnouncementSummary) => void
  onMarkRead?: (announcementId: string) => void
  onVote?: (input: { announcementId: string; optionId: string }) => void
}

function AnnouncementCard({
  announcement,
  isArchiving,
  isMarkingRead,
  isVoting = false,
  onArchive,
  onEdit,
  onMarkRead,
  onVote,
}: AnnouncementCardProps) {
  return (
    <article
      className={cn(
        "relative px-4 py-4 transition-colors sm:px-5 sm:py-5",
        announcement.isPinned && "bg-[#fbfcff]",
        announcement.status === "archived" && "bg-[#fafbfc]"
      )}
    >
      {announcement.isPinned ? (
        <span className="absolute inset-y-0 left-0 w-0.5 bg-[#0968f5]" />
      ) : null}

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {announcement.isPinned ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eef3ff] px-2 py-0.5 text-[11px] font-semibold text-[#0968f5]">
                <PinIcon className="size-3" />
                Pinned
              </span>
            ) : null}
            {announcement.poll ? (
              <span className="rounded-full bg-[#f2f5fb] px-2 py-0.5 text-[11px] font-semibold text-[#405078]">
                Poll
              </span>
            ) : null}
            {announcement.status === "archived" ? (
              <span className="rounded-full bg-[#f2f5fb] px-2 py-0.5 text-[11px] font-semibold text-[#61709a]">
                Archived
              </span>
            ) : null}
          </div>
          <h2 className="mt-1 text-base leading-snug font-bold tracking-[-0.02em] [overflow-wrap:anywhere] text-[#10204b] sm:text-[17px]">
            {announcement.title}
          </h2>
        </div>
        {announcement.isUnread ? (
          <span
            className="mt-1.5 size-2.5 shrink-0 rounded-full bg-[#0968f5]"
            aria-label="Unread"
          />
        ) : null}
      </div>

      <p className="mt-2 max-w-3xl text-sm leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap text-[#526789]">
        {announcement.body}
      </p>

      {announcement.poll && onVote ? (
        <AnnouncementPoll
          announcementId={announcement.id}
          disabled={announcement.status === "archived"}
          isVoting={isVoting}
          poll={announcement.poll}
          onVote={onVote}
        />
      ) : null}

      <div className="mt-4 flex flex-col gap-2 border-t border-[#edf0f6] pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-xs leading-5 [overflow-wrap:anywhere] text-[#7180a2]">
          Posted by {announcement.authorName} ·{" "}
          {formatDistanceToNow(new Date(announcement.publishedAt), {
            addSuffix: true,
          })}
        </p>
        {(announcement.isUnread ||
          (announcement.canManage && announcement.status === "active")) && (
          <div className="-ml-2 flex flex-wrap items-center gap-1 sm:ml-0 sm:justify-end">
            {announcement.isUnread ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-9 px-2 text-xs font-semibold text-[#0968f5] hover:bg-[#eef3ff]"
                disabled={isMarkingRead}
                onClick={() => onMarkRead?.(announcement.id)}
              >
                Mark read
              </Button>
            ) : null}
            {announcement.canManage && announcement.status === "active" ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-9 px-2 text-xs font-semibold text-[#405078]"
                  onClick={() => onEdit?.(announcement)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-9 px-2 text-xs font-semibold text-[#61709a]"
                  disabled={isArchiving}
                  onClick={() => onArchive?.(announcement)}
                >
                  Archive
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </article>
  )
}

export { AnnouncementCard }
