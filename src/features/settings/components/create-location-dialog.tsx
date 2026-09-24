"use client"

import * as React from "react"
import { MapPinPlusIcon } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import type {
  OnboardingBusinessType,
  OnboardingPlanningMode,
} from "@/features/onboarding/schemas/onboarding-schemas"
import { getErrorMessage } from "@/lib/errors"

type CreateLocationValues = {
  name: string
  businessType: OnboardingBusinessType
  planningMode: OnboardingPlanningMode
  zoneNames: string[]
  worksiteName: string
}

function CreateLocationDialog({
  pending,
  onSubmit,
}: {
  pending: boolean
  onSubmit: (values: CreateLocationValues) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [zoneText, setZoneText] = React.useState("Main area")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setName("")
      setZoneText("Main area")
      setError(null)
    }
  }, [open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const locationName = name.trim()
    const zoneNames = parseZoneNames(zoneText)

    if (locationName.length < 2) {
      setError("Enter a location name.")
      return
    }

    if (zoneNames.length === 0) {
      setError("Add at least one zone for this location.")
      return
    }

    try {
      await onSubmit({
        name: locationName,
        businessType: "hospitality",
        planningMode: "fixed_location",
        zoneNames,
        worksiteName: "",
      })
      setOpen(false)
    } catch (submissionError) {
      setError(
        getErrorMessage(submissionError, "We could not create that location.")
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="sm"
            className="h-9 gap-2 rounded-xl px-3 text-xs font-extrabold"
          />
        }
      >
        <MapPinPlusIcon className="size-4" />
        New location
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create location</DialogTitle>
          <DialogDescription>
            Add another workplace under this organisation.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <Field>
            <FieldLabel htmlFor="location-name">Location name</FieldLabel>
            <FieldContent>
              <Input
                id="location-name"
                value={name}
                maxLength={80}
                placeholder="Second bar"
                autoFocus
                onChange={(event) => setName(event.target.value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="location-zones">Initial zones</FieldLabel>
            <FieldContent>
              <Textarea
                id="location-zones"
                value={zoneText}
                rows={3}
                placeholder={"Main area\nBar\nKitchen"}
                onChange={(event) => setZoneText(event.target.value)}
              />
            </FieldContent>
          </Field>

          <FieldError>{error}</FieldError>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function parseZoneNames(value: string) {
  return Array.from(
    new Map(
      value
        .split(/[\n,]/)
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => [entry.toLowerCase(), entry])
    ).values()
  )
}

export { CreateLocationDialog }
