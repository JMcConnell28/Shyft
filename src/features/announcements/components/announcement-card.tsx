"use client"

import { formatDistanceToNow } from "date-fns"
import { ArchiveIcon, CheckIcon, PencilIcon } from "lucide-react"

import type { AnnouncementSummary } from "@/features/announcements/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function AnnouncementCard({
  announcement,
  isArchiving,
  isMarkingRead,
  onArchive,
  onEdit,
  onMarkRead,
}: {
  announcement: AnnouncementSummary
  isArchiving?: boolean
  isMarkingRead?: boolean
  onArchive?: (announcement: AnnouncementSummary) => void
  onEdit?: (announcement: AnnouncementSummary) => void
  onMarkRead?: (announcementId: string) => void
}) {
  return (
    <article
      className={cn(
        "rounded-lg border border-border/70 bg-background p-4 shadow-sm",
        announcement.isUnread && "border-primary/30 bg-primary/5",
        announcement.status === "archived" && "opacity-75",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {announcement.isUnread ? <Badge>New</Badge> : null}
            {announcement.status === "archived" ? (
              <Badge variant="outline">Archived</Badge>
            ) : null}
            <Badge variant="outline">{getTargetLabel(announcement)}</Badge>
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              {announcement.title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {announcement.authorName} ·{" "}
              {formatDistanceToNow(new Date(announcement.publishedAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {announcement.isUnread ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isMarkingRead}
              onClick={() => onMarkRead?.(announcement.id)}
            >
              <CheckIcon />
              Mark read
            </Button>
          ) : null}
          {announcement.canManage && announcement.status === "active" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit?.(announcement)}
              >
                <PencilIcon />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isArchiving}
                onClick={() => onArchive?.(announcement)}
              >
                <ArchiveIcon />
                Archive
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {announcement.body}
      </p>
    </article>
  )
}

function getTargetLabel(announcement: AnnouncementSummary) {
  if (announcement.targetScope === "organization") {
    return "Everyone"
  }

  if (announcement.targetLocations.length === 1) {
    return announcement.targetLocations[0]?.name ?? "Location"
  }

  return `${announcement.targetLocations.length} locations`
}

export { AnnouncementCard }
