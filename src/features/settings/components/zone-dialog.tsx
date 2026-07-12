"use client"

import * as React from "react"
import { PencilIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

type ZoneDialogLocation = { id: string; name: string }

function ZoneDialog({
  pending = false,
  submitLabel,
  title,
  description,
  defaultName = "",
  locations,
  triggerLabel,
  triggerVariant = "outline",
  onSubmit,
}: {
  pending?: boolean
  submitLabel: string
  title: string
  description: string
  defaultName?: string
  triggerLabel: React.ReactNode
  triggerVariant?: "outline" | "pill"
  locations?: Array<ZoneDialogLocation>
  onSubmit: (values: { name: string; locationId?: string }) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(defaultName)
  const [locationId, setLocationId] = React.useState(locations?.[0]?.id ?? "")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setName(defaultName)
      setLocationId(locations?.[0]?.id ?? "")
      setError(null)
    }
  }, [defaultName, locations, open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = name.trim()

    if (!normalizedName) {
      setError("Enter a zone name.")
      return
    }

    try {
      await onSubmit({
        name: normalizedName,
        locationId: locations ? locationId : undefined,
      })
      setOpen(false)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not save that zone."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={triggerVariant}
            size="sm"
            className="gap-2"
          />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <Field>
            <FieldLabel htmlFor="zone-name">Zone name</FieldLabel>
            <FieldContent>
              <Input
                id="zone-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Zone 1"
                maxLength={80}
                autoFocus
              />
              <FieldError>{error}</FieldError>
            </FieldContent>
          </Field>

          {locations ? (
            <Field className="mt-4">
              <FieldLabel htmlFor="zone-location">Location</FieldLabel>
              <FieldContent>
                <NativeSelect
                  id="zone-location"
                  className="w-full"
                  value={locationId}
                  onChange={(event) => setLocationId(event.target.value)}
                >
                  {locations.map((location) => (
                    <NativeSelectOption key={location.id} value={location.id}>
                      {location.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FieldContent>
            </Field>
          ) : null}

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CreateZoneDialog(
  props: Omit<
    React.ComponentProps<typeof ZoneDialog>,
    "triggerLabel" | "title" | "description" | "submitLabel"
  >
) {
  return (
    <ZoneDialog
      {...props}
      title="Create zone"
      description="Add another zone for this location so managers can place shifts more accurately."
      submitLabel="Create zone"
      triggerLabel={
        <>
          <PlusIcon className="size-3.5" />
          New zone
        </>
      }
      triggerVariant="pill"
    />
  )
}

function EditZoneDialog(
  props: Omit<
    React.ComponentProps<typeof ZoneDialog>,
    "triggerLabel" | "title" | "description" | "submitLabel" | "triggerVariant"
  >
) {
  return (
    <ZoneDialog
      {...props}
      title="Edit zone"
      description="Update the zone name used across rota planning for this location."
      submitLabel="Save changes"
      triggerLabel={
        <>
          <PencilIcon className="size-3.5" />
          Edit
        </>
      }
    />
  )
}

export { CreateZoneDialog, EditZoneDialog }
export type { ZoneDialogLocation }
