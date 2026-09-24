"use client"

import * as React from "react"
import { MegaphoneIcon } from "lucide-react"

import type {
  AnnouncementFilter,
  AnnouncementFormInput,
  AnnouncementPageData,
  AnnouncementScopeInput,
  AnnouncementSummary,
} from "@/features/announcements/types"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { AnnouncementCard } from "@/features/announcements/components/announcement-card"
import { AnnouncementDialog } from "@/features/announcements/components/announcement-dialog"
import { AnnouncementsToolbar } from "@/features/announcements/components/announcements-toolbar"
import { useAnnouncementMutations } from "@/features/announcements/hooks/use-announcement-mutations"
import { useAnnouncementsPageQuery } from "@/features/announcements/hooks/use-announcements-page-query"

type AnnouncementsPageProps = AnnouncementScopeInput & {
  initialData: AnnouncementPageData
  workspaceName: string
}

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
    if (filter === "unread") return announcement.isUnread
    if (filter === "pinned") return announcement.isPinned
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
    <main className="flex flex-1 bg-[#f6f8fc] px-4 py-5 pb-[max(2rem,env(safe-area-inset-bottom))] text-[#10204b] sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5">
        <AnnouncementsToolbar
          canCreate={data.canCreate}
          filter={filter}
          isMarkingAllRead={mutations.markAllReadMutation.isPending}
          unreadCount={data.unreadCount}
          workspaceName={workspaceName}
          onCreate={() => {
            setEditingAnnouncement(null)
            setDialogOpen(true)
          }}
          onFilterChange={setFilter}
          onMarkAllRead={() => mutations.markAllReadMutation.mutate()}
        />

        <section
          aria-label="Announcement feed"
          className="overflow-hidden rounded-xl border border-[#dfe5f0] bg-white shadow-[0_5px_18px_rgba(30,50,96,0.04)]"
        >
          {visibleAnnouncements.length === 0 ? (
            <Empty className="min-h-56 border-0 px-5 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MegaphoneIcon />
                </EmptyMedia>
                <EmptyTitle>No announcements found</EmptyTitle>
                <EmptyDescription>
                  {filter === "all"
                    ? "Published announcements for this workspace will appear here."
                    : `There are no ${filter} announcements.`}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="divide-y divide-[#e7ebf3]">
              {visibleAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  isArchiving={mutations.archiveMutation.isPending}
                  isMarkingRead={mutations.markReadMutation.isPending}
                  isVoting={mutations.voteMutation.isPending}
                  onArchive={(item) =>
                    mutations.archiveMutation.mutate(item.id)
                  }
                  onEdit={(item) => {
                    setEditingAnnouncement(item)
                    setDialogOpen(true)
                  }}
                  onMarkRead={(announcementId) =>
                    mutations.markReadMutation.mutate(announcementId)
                  }
                  onVote={(input) => mutations.voteMutation.mutate(input)}
                />
              ))}
            </div>
          )}
        </section>

        {data.canViewArchived ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full self-center rounded-lg border-[#dfe5f0] bg-white px-4 text-xs font-semibold text-[#0968f5] hover:bg-[#f8faff] sm:w-auto"
            onClick={() => setIncludeArchived((current) => !current)}
          >
            {includeArchived ? "Hide archived" : "Include archived"}
          </Button>
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
    </main>
  )
}

export { AnnouncementsPage }
