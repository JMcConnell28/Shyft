"use client"

import * as React from "react"
import { LoaderCircleIcon } from "lucide-react"

import {
  announcementFormSchema,
  type AnnouncementFormInput,
} from "@/features/announcements/schemas/announcement-schemas"
import type {
  AnnouncementLocationTarget,
  AnnouncementSummary,
} from "@/features/announcements/types"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type AnnouncementDialogProps = {
  announcement?: AnnouncementSummary | null
  canTargetOrganization: boolean
  manageableLocations: AnnouncementLocationTarget[]
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AnnouncementFormInput) => Promise<void>
  open: boolean
  pending?: boolean
}

function AnnouncementDialog({
  announcement,
  canTargetOrganization,
  manageableLocations,
  onOpenChange,
  onSubmit,
  open,
  pending,
}: AnnouncementDialogProps) {
  const [title, setTitle] = React.useState("")
  const [body, setBody] = React.useState("")
  const [targetScope, setTargetScope] =
    React.useState<AnnouncementFormInput["targetScope"]>("locations")
  const [targetLocationIds, setTargetLocationIds] = React.useState<string[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const isEditing = Boolean(announcement)

  React.useEffect(() => {
    if (!open) {
      return
    }

    setTitle(announcement?.title ?? "")
    setBody(announcement?.body ?? "")
    setTargetScope(
      announcement?.targetScope ??
        (canTargetOrganization ? "organization" : "locations"),
    )
    setTargetLocationIds(
      announcement?.targetLocations.map((location) => location.id) ??
        manageableLocations.map((location) => location.id).slice(0, 1),
    )
    setError(null)
  }, [announcement, canTargetOrganization, manageableLocations, open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = announcementFormSchema.safeParse({
      body,
      targetLocationIds,
      targetScope,
      title,
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the announcement.")
      return
    }

    setError(null)
    await onSubmit(parsed.data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-5 pt-5">
            <DialogTitle>
              {isEditing ? "Edit announcement" : "New announcement"}
            </DialogTitle>
            <DialogDescription>
              Publish a short update for everyone or selected locations.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-5">
            <label className="grid gap-1.5 text-sm font-medium">
              Title
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Kitchen deep clean tonight"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Message
              <Textarea
                className="min-h-32"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Share the update your team needs to know."
              />
            </label>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Audience</legend>
              {canTargetOrganization ? (
                <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
                  <input
                    type="radio"
                    checked={targetScope === "organization"}
                    onChange={() => setTargetScope("organization")}
                  />
                  Everyone in the organisation
                </label>
              ) : null}
              <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
                <input
                  type="radio"
                  checked={targetScope === "locations"}
                  onChange={() => setTargetScope("locations")}
                />
                Selected locations
              </label>
            </fieldset>

            {targetScope === "locations" ? (
              <div className="grid gap-2">
                <p className="text-sm font-medium">Locations</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {manageableLocations.map((location) => (
                    <label
                      key={location.id}
                      className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={targetLocationIds.includes(location.id)}
                        onChange={(event) => {
                          setTargetLocationIds((current) =>
                            event.target.checked
                              ? [...current, location.id]
                              : current.filter((id) => id !== location.id),
                          )
                        }}
                      />
                      {location.name}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <FormErrorMessage message={error} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
              {isEditing ? "Save changes" : "Publish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { AnnouncementDialog }
