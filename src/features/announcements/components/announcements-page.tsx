"use client"

import * as React from "react"
import { MapPinIcon, PlusIcon } from "lucide-react"

import type {
  AnnouncementFormInput,
  AnnouncementPageData,
  AnnouncementScopeInput,
  AnnouncementSummary,
} from "@/features/announcements/types"
import { AnnouncementCard } from "@/features/announcements/components/announcement-card"
import { AnnouncementDialog } from "@/features/announcements/components/announcement-dialog"
import { useAnnouncementMutations } from "@/features/announcements/hooks/use-announcement-mutations"
import { useAnnouncementsPageQuery } from "@/features/announcements/hooks/use-announcements-page-query"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

type AnnouncementFilter = "all" | "pinned" | "unread"

type AnnouncementsPageProps = AnnouncementScopeInput & {
  initialData: AnnouncementPageData
  workspaceName: string
}

const filters: Array<{ label: string; value: AnnouncementFilter }> = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Pinned", value: "pinned" },
]

function AnnouncementsPage({
  initialData,
  workspaceName,
  ...scope
}: AnnouncementsPageProps) {
  const [filter, setFilter] = React.useState<AnnouncementFilter>("all")
  const [includeArchived, setIncludeArchived] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingAnnouncement, setEditingAnnouncement] =
    React.useState<AnnouncementSummary | null>(null)
  const queryInput = { ...scope, includeArchived }
  const query = useAnnouncementsPageQuery(queryInput, initialData)
  const data = query.data ?? initialData
  const mutations = useAnnouncementMutations(queryInput)
  const visibleAnnouncements = data.announcements.filter((announcement) => {
    if (filter === "unread") {
      return announcement.isUnread
    }

    if (filter === "pinned") {
      return announcement.isPinned
    }

    return true
  })

  async function handleSubmit(input: AnnouncementFormInput) {
    if (editingAnnouncement) {
      await mutations.updateMutation.mutateAsync({
        ...input,
        announcementId: editingAnnouncement.id,
      })
      return
    }

    await mutations.createMutation.mutateAsync(input)
  }

  return (
    <div className="flex flex-1 flex-col bg-white px-[18px] pt-5 pb-[max(2rem,env(safe-area-inset-bottom))] text-[#102047] md:bg-[#f7f8fb] md:px-5">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <header>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[26px] leading-none font-bold tracking-[-0.035em]">
                Announcements
              </h1>
              <p className="mt-2.5 text-sm font-medium text-[#526789]">
                Important updates from your workplace
              </p>
            </div>
            {data.canCreate ? (
              <Button
                className="h-10 shrink-0 gap-1.5 rounded-[10px] bg-[#0868f7] px-3 text-xs font-semibold text-white shadow-[0_7px_16px_rgba(8,104,247,0.16)] hover:bg-[#005de2]"
                onClick={() => {
                  setEditingAnnouncement(null)
                  setDialogOpen(true)
                }}
              >
                <PlusIcon className="size-4" />
                New
              </Button>
            ) : null}
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#526789]">
            <MapPinIcon className="size-4" />
            {workspaceName}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    "h-9 rounded-full border px-4 text-xs font-semibold transition-colors",
                    filter === item.value
                      ? "border-[#0868f7] bg-[#0868f7] text-white"
                      : "border-[#d9e1ed] bg-white text-[#405579] hover:bg-[#f7f9fc]"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {data.unreadCount > 0 ? (
              <button
                type="button"
                disabled={mutations.markAllReadMutation.isPending}
                onClick={() => mutations.markAllReadMutation.mutate()}
                className="hidden text-xs font-semibold text-[#0868f7] sm:block"
              >
                Mark all read
              </button>
            ) : null}
          </div>
        </header>

        <main className="mt-5 grid gap-2.5">
          {visibleAnnouncements.length === 0 ? (
            <Empty className="rounded-xl border border-dashed border-[#d9e1ed] bg-white py-12">
              <EmptyHeader>
                <EmptyTitle>No announcements found</EmptyTitle>
                <EmptyDescription>
                  {filter === "all"
                    ? "Published announcements for your workspace will appear here."
                    : `There are no ${filter} announcements.`}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            visibleAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                isArchiving={mutations.archiveMutation.isPending}
                isMarkingRead={mutations.markReadMutation.isPending}
                isVoting={mutations.voteMutation.isPending}
                onArchive={(item) => mutations.archiveMutation.mutate(item.id)}
                onEdit={(item) => {
                  setEditingAnnouncement(item)
                  setDialogOpen(true)
                }}
                onMarkRead={(announcementId) =>
                  mutations.markReadMutation.mutate(announcementId)
                }
                onVote={(input) => mutations.voteMutation.mutate(input)}
              />
            ))
          )}
        </main>

        {data.canViewArchived ? (
          <button
            type="button"
            onClick={() => setIncludeArchived((current) => !current)}
            className="mt-3 h-11 rounded-xl border border-[#d9e1ed] bg-white text-xs font-semibold text-[#0868f7] transition-colors hover:bg-[#f7f9fc]"
          >
            {includeArchived
              ? "Hide archived announcements"
              : "View archived announcements"}
          </button>
        ) : null}
      </div>

      <AnnouncementDialog
        announcement={editingAnnouncement}
        canTargetOrganization={data.canTargetOrganization}
        manageableLocations={data.manageableLocations}
        open={dialogOpen}
        pending={
          mutations.createMutation.isPending ||
          mutations.updateMutation.isPending
        }
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export { AnnouncementsPage }
