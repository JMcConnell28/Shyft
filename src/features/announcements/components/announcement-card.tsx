"use client"

import { formatDistanceToNow } from "date-fns"
import { PinIcon } from "lucide-react"

import type { AnnouncementSummary } from "@/features/announcements/types"
import { AnnouncementPoll } from "@/features/announcements/components/announcement-poll"
import { Button } from "@/components/ui/button"
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
        "rounded-xl border border-[#e0e7f1] bg-white p-4 text-[#102047] shadow-[0_3px_10px_rgba(30,50,96,0.06)]",
        announcement.isPinned && "border-[#c7d9ff] bg-[#fbfdff]",
        announcement.status === "archived" && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            {announcement.isPinned ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#edf3ff] px-2 py-0.5 text-[11px] font-semibold text-[#0868f7]">
                <PinIcon className="size-3" />
                Pinned
              </span>
            ) : null}
            {announcement.poll ? (
              <span className="rounded-md bg-[#f2edff] px-2 py-0.5 text-[11px] font-semibold text-[#7047c6]">
                Poll
              </span>
            ) : null}
            {announcement.status === "archived" ? (
              <span className="rounded-md bg-[#f2f4f7] px-2 py-0.5 text-[11px] font-semibold text-[#667085]">
                Archived
              </span>
            ) : null}
          </div>
          <h2 className="text-[15px] leading-5 font-semibold tracking-[-0.01em]">
            {announcement.title}
          </h2>
        </div>
        {announcement.isUnread ? (
          <span
            className="mt-1 size-2.5 shrink-0 rounded-full bg-[#0868f7]"
            aria-label="Unread"
          />
        ) : null}
      </div>

      <p className="mt-1.5 text-[13px] leading-5 whitespace-pre-wrap text-[#526789]">
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

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="min-w-0 truncate text-[11px] font-medium text-[#71809d]">
          Posted by {announcement.authorName} ·{" "}
          {formatDistanceToNow(new Date(announcement.publishedAt), {
            addSuffix: true,
          })}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {announcement.isUnread ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11px] text-[#0868f7]"
              disabled={isMarkingRead}
              onClick={() => onMarkRead?.(announcement.id)}
            >
              Mark read
            </Button>
          ) : null}
          {announcement.canManage && announcement.status === "active" ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px]"
                onClick={() => onEdit?.(announcement)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px] text-muted-foreground"
                disabled={isArchiving}
                onClick={() => onArchive?.(announcement)}
              >
                Archive
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export { AnnouncementCard }
