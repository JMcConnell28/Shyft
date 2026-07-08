"use client"

import * as React from "react"
import { MegaphoneIcon, PlusIcon } from "lucide-react"

import { AnnouncementCard } from "@/features/announcements/components/announcement-card"
import { AnnouncementDialog } from "@/features/announcements/components/announcement-dialog"
import { useAnnouncementMutations } from "@/features/announcements/hooks/use-announcement-mutations"
import { useAnnouncementsPageQuery } from "@/features/announcements/hooks/use-announcements-page-query"
import type { AnnouncementFormInput } from "@/features/announcements/schemas/announcement-schemas"
import type {
  AnnouncementPageData,
  AnnouncementScopeInput,
  AnnouncementSummary,
} from "@/features/announcements/types"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Switch } from "@/components/ui/switch"

type AnnouncementsPageProps = AnnouncementScopeInput & {
  initialData: AnnouncementPageData
}

function AnnouncementsPage({ initialData, ...scope }: AnnouncementsPageProps) {
  const [includeArchived, setIncludeArchived] = React.useState(false)
  const queryInput = {
    ...scope,
    includeArchived,
  }
  const query = useAnnouncementsPageQuery(queryInput, initialData)
  const data = query.data ?? initialData
  const mutations = useAnnouncementMutations(queryInput)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingAnnouncement, setEditingAnnouncement] =
    React.useState<AnnouncementSummary | null>(null)

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
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
      <section className="rounded-lg border border-border/70 bg-background/95 p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Announcements
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Share updates with everyone or selected locations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {data.canViewArchived ? (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch
                  checked={includeArchived}
                  onCheckedChange={setIncludeArchived}
                />
                Archived
              </label>
            ) : null}
            {data.unreadCount > 0 ? (
              <Button
                variant="outline"
                disabled={mutations.markAllReadMutation.isPending}
                onClick={() => mutations.markAllReadMutation.mutate()}
              >
                Mark all read
              </Button>
            ) : null}
            {data.canCreate ? (
              <Button
                onClick={() => {
                  setEditingAnnouncement(null)
                  setDialogOpen(true)
                }}
              >
                <PlusIcon />
                New announcement
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {data.announcements.length === 0 ? (
        <Empty className="rounded-lg border border-dashed border-border/70 bg-background/95 py-12">
          <EmptyHeader>
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MegaphoneIcon className="size-5" />
            </div>
            <EmptyTitle>No announcements yet</EmptyTitle>
            <EmptyDescription>
              Published announcements for your workspace will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3">
          {data.announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isArchiving={mutations.archiveMutation.isPending}
              isMarkingRead={mutations.markReadMutation.isPending}
              onArchive={(item) => mutations.archiveMutation.mutate(item.id)}
              onEdit={(item) => {
                setEditingAnnouncement(item)
                setDialogOpen(true)
              }}
              onMarkRead={(announcementId) =>
                mutations.markReadMutation.mutate(announcementId)
              }
            />
          ))}
        </div>
      )}

      <AnnouncementDialog
        announcement={editingAnnouncement}
        canTargetOrganization={data.canTargetOrganization}
        manageableLocations={data.manageableLocations}
        open={dialogOpen}
        pending={
          mutations.createMutation.isPending || mutations.updateMutation.isPending
        }
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export { AnnouncementsPage }
