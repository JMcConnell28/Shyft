"use client"

import * as React from "react"
import { LoaderCircleIcon } from "lucide-react"

import type {
  AnnouncementFormInput,
  AnnouncementLocationTarget,
  AnnouncementSummary,
} from "@/features/announcements/types"
import { announcementFormSchema } from "@/features/announcements/schemas/announcement-schemas"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type AnnouncementDialogProps = {
  announcement?: AnnouncementSummary | null
  canTargetOrganization: boolean
  manageableLocations: Array<AnnouncementLocationTarget>
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
  const [hasPoll, setHasPoll] = React.useState(false)
  const [isPinned, setIsPinned] = React.useState(false)
  const [pollOptions, setPollOptions] = React.useState<Array<string>>([])
  const [targetScope, setTargetScope] =
    React.useState<AnnouncementFormInput["targetScope"]>("locations")
  const [targetLocationIds, setTargetLocationIds] = React.useState<
    Array<string>
  >([])
  const [error, setError] = React.useState<string | null>(null)
  const isEditing = Boolean(announcement)

  React.useEffect(() => {
    if (!open) {
      return
    }

    setTitle(announcement?.title ?? "")
    setBody(announcement?.body ?? "")
    setHasPoll(Boolean(announcement?.poll))
    setIsPinned(announcement?.isPinned ?? false)
    setPollOptions(
      announcement?.poll?.options.map((option) => option.label) ?? []
    )
    setTargetScope(
      announcement?.targetScope ??
        (canTargetOrganization ? "organization" : "locations")
    )
    setTargetLocationIds(
      announcement?.targetLocations.map((location) => location.id) ??
        manageableLocations.map((location) => location.id).slice(0, 1)
    )
    setError(null)
  }, [announcement, canTargetOrganization, manageableLocations, open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = announcementFormSchema.safeParse({
      body,
      isPinned,
      pollOptions: hasPoll ? pollOptions : [],
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

            <div className="grid gap-3 rounded-lg border border-border/70 p-3">
              <label className="flex items-center justify-between gap-3 text-sm font-medium">
                <span>
                  Pin announcement
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    Keep this announcement at the top of the feed.
                  </span>
                </span>
                <Switch checked={isPinned} onCheckedChange={setIsPinned} />
              </label>

              <label className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-sm font-medium">
                <span>
                  Add a poll
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    Let each team member choose one option.
                  </span>
                </span>
                <Switch
                  checked={hasPoll}
                  onCheckedChange={(checked) => {
                    setHasPoll(checked)
                    if (checked && pollOptions.length < 2) {
                      setPollOptions(["", ""])
                    }
                  }}
                />
              </label>
            </div>

            {hasPoll ? (
              <fieldset className="grid gap-2">
                <legend className="text-sm font-medium">Poll options</legend>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      maxLength={120}
                      placeholder={`Option ${index + 1}`}
                      aria-label={`Poll option ${index + 1}`}
                      onChange={(event) => {
                        const value = event.target.value
                        setPollOptions((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? value : item
                          )
                        )
                      }}
                    />
                    {pollOptions.length > 2 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setPollOptions((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index
                            )
                          )
                        }
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                ))}
                {pollOptions.length < 6 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                      setPollOptions((current) => [...current, ""])
                    }
                  >
                    Add option
                  </Button>
                ) : null}
              </fieldset>
            ) : null}

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
                              : current.filter((id) => id !== location.id)
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
